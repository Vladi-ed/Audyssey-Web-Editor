export const onRequestPost = async (context) => {
    try {
        const { request, env } = context;

        // 1. Check content type
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return new Response("Error: Expected JSON content type", { status: 400 });
        }

        // 2. Parse and validate the JSON
        const data = await request.json();

        if (!data || Object.keys(data).length === 0) {
            return new Response("Error: JSON body is empty", { status: 400 });
        }

        // 3. Generate a unique key for the new record
        // Using timestamp + random string to ensure uniqueness
        const key = `stat_${Date.now()}_${request.cf.country}`;

        // 4. Save to KV
        // 'KV' is the binding name from your environment
        await env.KV.put(key, JSON.stringify(data));

        // 5. Return success response
        return new Response(JSON.stringify({ success: true, id: key, message: "Record saved" }), {
            headers: { "Content-Type": "application/json" },
            status: 201
        });

    } catch (err) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
};
