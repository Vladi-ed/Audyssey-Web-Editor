export const onRequestGet = async ({ env }) => {
    try {
        const records = [];
        let cursor;

        do {
            const page = await env.KV.list({
                cursor,
                limit: 1000
            });

            const pageRecords = await Promise.all(
                page.keys.map(async ({ name, metadata }) => {
                    const value = await env.KV.get(name, { type: "json" });

                    return {
                        key: name,
                        value,
                        metadata
                    };
                })
            );

            records.push(...pageRecords);
            cursor = page.list_complete ? undefined : page.cursor;
        } while (cursor);

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

