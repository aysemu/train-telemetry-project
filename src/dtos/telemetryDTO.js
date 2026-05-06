const { z } = require("zod");

// Telemetri verisi
const telemetrySchemaDTO = z.object({
  trainId: z.string().min(1, "Train ID boş olamaz"),
  speed: z.number().min(0, "Hız negatif olamaz"),
  latitude: z.number(),
  longitude: z.number(),
  temperature: z.number(),
  timestamp: z.preprocess((arg) => (arg ? new Date(arg) : new Date()), z.date())
});

module.exports = { telemetrySchemaDTO };