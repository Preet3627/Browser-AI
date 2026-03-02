import React from 'react';

interface ConversationHistoryPanelProps {
    conversations: any[];
    onSelectConversation: (id: string) => void;
}

const ConversationHistoryPanel: React.FC<ConversationHistoryPanelProps> = ({ conversations, onSelectConversation }) => {
    return (
        <div>
            {conversations.map(conversation => (
                <div key={conversation.id} onClick={() => onSelectConversation(conversation.id)}>
                    {conversation.title}
                </div>
            ))}
        </div>
    );
};

export default ConversationHistoryPanel;