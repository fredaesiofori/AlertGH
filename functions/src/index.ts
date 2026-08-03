import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

interface TokenDoc {
  token: string;
  geofence: string;       // 'all' or region name
  severities: string[];
  categories: string[];
}

async function getMatchingTokens(
  region: string,
  severity: string,
  category: string
): Promise<string[]> {
  const snapshot = await db.collection('fcm_tokens').get();
  const tokens: string[] = [];
  snapshot.forEach((docSnap) => {
    const d = docSnap.data() as TokenDoc;
    if (!d.token) return;
    const geofenceMatch = d.geofence === 'all' || d.geofence?.toLowerCase() === region?.toLowerCase();
    const severityMatch = d.severities?.includes(severity);
    const categoryMatch = d.categories?.includes(category);
    if (geofenceMatch && severityMatch && categoryMatch) tokens.push(d.token);
  });
  return tokens;
}

async function sendToTokens(tokens: string[], title: string, body: string, incidentId: string) {
  if (tokens.length === 0) return;

  // FCM sendEachForMulticast supports up to 500 tokens per call
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));

  for (const chunk of chunks) {
    const response = await messaging.sendEachForMulticast({
      tokens: chunk,
      notification: { title, body },
      data: { incidentId },
      webpush: {
        notification: {
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          tag: incidentId,
          renotify: true,
        },
        fcmOptions: { link: `/?incident=${incidentId}` },
      },
    });

    // Clean up stale tokens that are no longer valid
    const staleTokens: Promise<void>[] = [];
    response.responses.forEach((res, idx) => {
      if (!res.success && (
        res.error?.code === 'messaging/registration-token-not-registered' ||
        res.error?.code === 'messaging/invalid-registration-token'
      )) {
        staleTokens.push(
          db.collection('fcm_tokens')
            .where('token', '==', chunk[idx])
            .get()
            .then(snap => Promise.all(snap.docs.map(d => d.ref.delete())))
            .then(() => undefined)
        );
      }
    });
    await Promise.all(staleTokens);
  }
}

// Trigger: new incident created
export const onIncidentCreated = onDocumentCreated('incidents/{incidentId}', async (event) => {
  const incident = event.data?.data();
  if (!incident) return;

  const tokens = await getMatchingTokens(incident.region, incident.severity, incident.category);
  const title = `🚨 ${incident.severity.toUpperCase()} ALERT — ${incident.region}`;
  const body = `${incident.title} in ${incident.city}.`;
  await sendToTokens(tokens, title, body, event.params.incidentId);
});

// Trigger: incident status or severity updated
export const onIncidentUpdated = onDocumentUpdated('incidents/{incidentId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  const statusChanged = before.status !== after.status;
  const severityChanged = before.severity !== after.severity;
  if (!statusChanged && !severityChanged) return;

  const tokens = await getMatchingTokens(after.region, after.severity, after.category);
  const title = statusChanged
    ? `🔄 ${after.status.toUpperCase()}: ${after.region}`
    : `⚠️ SEVERITY UPDATED: ${after.region}`;
  const body = `${after.title} in ${after.city} — now ${statusChanged ? after.status : after.severity}.`;
  await sendToTokens(tokens, title, body, event.params.incidentId);
});
