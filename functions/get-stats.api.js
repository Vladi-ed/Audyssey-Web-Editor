const RECORD_LIMIT = 99;

export const onRequestGet = async ({ env }) => {
    try {
        const allKeys = [];
        let cursor;

        // KV does not support reverse listing, so collect the key names first.
        do {
            const page = await env.KV.list({
                cursor,
                limit: 1000
            });

            allKeys.push(...page.keys);

            cursor = page.list_complete
                ? undefined
                : page.cursor;
        } while (cursor);

        const latestKeys = allKeys
            .sort((first, second) => first.name.localeCompare(second.name))
            .slice(-RECORD_LIMIT)
            .reverse();

        // Read only the selected 99 records.
        const records = [];

        for (const { name, metadata, expiration } of latestKeys) {
            const value = await env.KV.get(name, { type: "json" });

            records.push({
                key: name,
                value,
                metadata: metadata ?? null,
                expiration: expiration ?? null
            });
        }

        return Response.json({
            success: true,
            count: records.length,
            records
        });
    } catch (err) {
        return Response.json(
            {
                success: false,
                error: err instanceof Error ? err.message : String(err)
            },
            { status: 500 }
        );
    }
};
