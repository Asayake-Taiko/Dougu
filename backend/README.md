# Setup

Use the supabase CLI and docker.
```
npm install
npx supabase init
npx supabase link
```

Start the supabase server
```
npx supabase start -x vector
```

Start powersync 
```
docker compose up
```

# Testing
Make sure the supabase and powersync are running, then run
```
npm run test
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