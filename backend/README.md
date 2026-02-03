# Setup

Use the supabase CLI and docker.
```
npm install
npx supabase init
npx supabase link
```

Start the backend
```
npx supabase start -x vector // supabase backend
docker compose up            // powersync
```

# Closing
Close supabase and powersync
```
npx supabase stop
docker compose down
```

# Other
Pull changes from cloud to local:
```
npx supabase db pull --db-url "postgresql://postgres.letoghfwotjbrzwgocpc:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
```

Reset Data to Default:
```
npx supabase db reset
```