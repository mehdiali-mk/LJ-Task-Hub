const probe = async () => {
    try {
        const r1 = await fetch("http://localhost:8088/api-v1/auth/send-verification", {
             method: "POST"
        });
        console.log(`Verify Route Status: ${r1.status} ${r1.statusText}`);
    } catch (e) {
        console.log(`Verify Route Error: ${e.message}`);
    }

    try {
        const r2 = await fetch("http://localhost:8088/api-v1/auth/login", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({})
        });
        console.log(`Login Route Status: ${r2.status} ${r2.statusText}`);
    } catch (e) {
        console.log(`Login Route Error: ${e.message}`);
    }
};
probe();
