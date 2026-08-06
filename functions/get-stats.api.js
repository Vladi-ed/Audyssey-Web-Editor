const MAX_PAGE_SIZE = 1000;
const BULK_READ_SIZE = 100;

export const onRequestGet = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const requestedLimit = Number.parseInt(
            url.searchParams.get("limit") ?? String(MAX_PAGE_SIZE),
            10
        );

        const limit = Number.isFinite(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
            : MAX_PAGE_SIZE;

        const cursor = url.searchParams.get("cursor") ?? undefined;

        const page = await env.KV.list({
            cursor,
            limit
        });

        const records = [];

        for (let index = 0; index < page.keys.length; index += BULK_READ_SIZE) {
            const keys = page.keys.slice(index, index + BULK_READ_SIZE);
            const names = keys.map(({ name }) => name);

            // A bulk read supports up to 100 keys and counts as one operation.
            const values = await env.KV.get(names, { type: "json" });

            for (const { name, metadata, expiration } of keys) {
                records.push({
                    key: name,
                    value: values.get(name) ?? null,
                    metadata: metadata ?? null,
                    expiration: expiration ?? null
                });
            }
        }

        return Response.json({
            success: true,
            count: records.length,
            records,
            listComplete: page.list_complete,
            cursor: page.list_complete ? null : page.cursor
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
