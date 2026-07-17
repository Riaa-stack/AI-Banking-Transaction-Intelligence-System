from flask import Blueprint

from app.controllers.chatbot_controller import ChatbotController


chatbot_bp = Blueprint(
    "chatbot",
    __name__
)


# ==========================================
# AI Chat
# ==========================================

@chatbot_bp.route(
    "/chat",
    methods=["POST"]
)
def chat():

    return ChatbotController.chat()


# ==========================================
# Reset Conversation
# ==========================================

@chatbot_bp.route(
    "/reset",
    methods=["POST"]
)
def reset():

    return ChatbotController.reset()


# ==========================================
# Health Check
# ==========================================

@chatbot_bp.route(
    "/health",
    methods=["GET"]
)
def health():

    return ChatbotController.health()