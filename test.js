// test.js - simple fetch tests for chat and usage endpoints
(async () => {
    try {
        const chatRes = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello', conversationId: 'test123' })
        });
        const chatData = await chatRes.json();
        console.log('Chat response:', chatData);

        const usageRes = await fetch('http://localhost:3000/usage');
        const usageData = await usageRes.json();
        console.log('Usage count after request:', usageData);
    } catch (err) {
        console.error('Error during test:', err);
    }
})();
