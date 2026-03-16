# mqx2mongo

A lightweight Node.js middleware service that bridges an **MQTT broker** and a **MongoDB Atlas** cluster. It subscribes to an MQTT topic, parses incoming JSON messages, and persists them into dynamically managed capped collections in MongoDB.

---

## How it works

1. Connects to an MQTT broker and subscribes to the `objects/raw` topic.
2. Connects to a MongoDB Atlas cluster.
3. For each incoming message:
   - Parses the JSON payload.
   - Uses the `id` field as the collection name.
   - Creates a new [capped collection](https://www.mongodb.com/docs/manual/core/capped-collections/) if one does not exist yet (max 14 400 documents / ~1.7 MB).
   - Inserts the message (without the `id` field, plus a `when` timestamp) into the collection.

---

## Requirements

- [Node.js](https://nodejs.org/) ≥ 12
- A running MQTT broker (e.g. [Mosquitto](https://mosquitto.org/))
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any MongoDB instance accessible via a `mongodb+srv://` URI)

---

## Installation

```bash
git clone https://github.com/Liturgy-Bureau/mqx2mongo.git
cd mqx2mongo
npm install
```

---

## Configuration

All credentials and connection details are read from environment variables. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MQTT_BROKER_URL` | URL of the MQTT broker (e.g. `mqtt://127.0.0.1` or `mqtts://broker.example.com`) |
| `MQTT_USERNAME` | MQTT broker username |
| `MQTT_PASSWORD` | MQTT broker password |
| `MONGODB_URL` | Full MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net?retryWrites=true&w=majority`) |

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## Usage

```bash
node mqx2mdb.js
```

The service will log `middleware running...` on start, then `connected to liturgy mqtt broker` once the MQTT connection is established, and `connected!` once the MongoDB connection is ready.

---

## MQTT message format

Messages published to `objects/raw` must be valid JSON and include an `id` field that identifies the target collection:

```json
{
  "id": "sensor-001",
  "temperature": 22.5,
  "humidity": 60
}
```

The `id` field is stripped before storage; a `when` field (Unix timestamp in ms) is added automatically.

---

## License

[ISC](LICENSE)
