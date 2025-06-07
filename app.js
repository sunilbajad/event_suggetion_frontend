document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const conversationSummary = document.getElementById('conversation-summary');
    const addEventForm = document.getElementById('add-event-form');

    // Chat state
    let currentChatId = null;

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });

    // Send message when Enter key is pressed (without Shift)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send message when Send button is clicked
    sendButton.addEventListener('click', sendMessage);

    // Add event form submission
    addEventForm.addEventListener('submit', addEvent);

    // Function to send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat('user', message);

        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Send to API
        fetchChatResponse(message);
    }

    // Function to add message to chat UI
    // Add this new function to your app.js file
    function typeWriterEffect(element, text, speed = 30, index = 0) {
        if (index < text.length) {
            // Handle HTML tags properly
            if (text.substring(index).startsWith('<br>')) {
                element.innerHTML += '<br>';
                index += 4; // Skip the <br> tag
            } else {
                element.innerHTML += text.charAt(index);
                index++;
            }

            setTimeout(() => typeWriterEffect(element, text, speed, index), speed);
        }
    }

    // Modify the addMessageToChat function to use the typewriter effect for assistant messages
    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        // Create paragraph element
        const paragraph = document.createElement('p');
        messageContent.appendChild(paragraph);

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        // Process content to handle newlines
        const formattedContent = content.replace(/\n/g, '<br>');

        // Use typewriter effect only for assistant messages
        if (role === 'assistant') {
            // Start with empty content and use typewriter effect
            typeWriterEffect(paragraph, formattedContent);
        } else {
            // For user messages, display immediately
            paragraph.innerHTML = formattedContent;
        }

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Modify the fetchChatResponse function to remove the typing delay
    // since we're now using the typewriter effect instead
    async function fetchChatResponse(question) {
        try {
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message assistant';
            typingIndicator.innerHTML = `
                <div class="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            chatMessages.appendChild(typingIndicator);

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const response = await fetch('https://event-suggetion.vercel.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question,
                    chatId: currentChatId
                })
            });

            // Remove typing indicator
            chatMessages.removeChild(typingIndicator);

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Add assistant response to chat with typewriter effect
            // (no need for typing delay since typewriter effect handles this)
            addMessageToChat('assistant', data.answer);

            // Update chat ID and summary
            currentChatId = data.chatId;

            if (data.summary) {
                conversationSummary.innerHTML = `<p>${data.summary}</p>`;
            }

        } catch (error) {
            console.error('Error:', error);
            // addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    // Function to add a new event
    async function addEvent(e) {
        e.preventDefault();

        const eventData = {
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            location: document.getElementById('event-location').value,
            date: document.getElementById('event-date').value
        };

        try {
            const response = await fetch('https://event-suggetion.vercel.app/api/add-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                throw new Error('Failed to add event');
            }

            const data = await response.json();

            // Show success message
            alert('Event added successfully!');

            // Clear form
            addEventForm.reset();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add event. Please try again.');
        }
    }

    // Initialize with a welcome message
    // This is already in the HTML, but you could add it dynamically here instead
});