import { RedisPubSub } from 'graphql-redis-subscriptions';

export const pubsub = new RedisPubSub({
    connection: {
        host: 'striking-jaguar-26495.upstash.io', // Endpoint из Upstash
        port: 6379, // Port из Upstash
        password: 'AWd_AAIjcDFlMDg0ZWZkZTM3NmU0ZWNmYTNkNDI1NmUzNzAwYTRiOXAxMA',
        // При включённом TLS у Upstash часто бывает, что host/port те же, но нужно явно указать TLS
        tls: {
            rejectUnauthorized: false,
        },
    },
});