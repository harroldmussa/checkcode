db = db.getSiblingDB('code-quality-dashboard');
db.createCollection('repositories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'owner', 'githubId', 'url'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        owner: { bsonType: 'string', minLength: 1 },
        githubId: { bsonType: 'number', minimum: 1 },
        url: { bsonType: 'string', pattern: '^https://github.com/' }
      }
    }
  }
});

db.createCollection('analyses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['repository', 'qualityScore'],
      properties: {
        repository: { bsonType: 'objectId' },
        qualityScore: { bsonType: 'number', minimum: 0, maximum: 100 }
      }
    }
  }
});


db.repositories.createIndex({ "owner": 1, "name": 1 }, { unique: true });
db.repositories.createIndex({ "githubId": 1 }, { unique: true });
db.repositories.createIndex({ "lastQualityScore": -1 });
db.repositories.createIndex({ "language": 1 });
db.repositories.createIndex({ "createdAt": -1 });

db.analyses.createIndex({ "repository": 1, "createdAt": -1 });
db.analyses.createIndex({ "qualityScore": -1 });
db.analyses.createIndex({ "status": 1 });

print('MongoDB initialized successfully for Code Quality Dashboard');