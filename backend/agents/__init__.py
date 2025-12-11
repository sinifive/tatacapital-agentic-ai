"""Agents module for Tata Capital agentic AI."""
from .master import MasterAgent
from .workers import SalesAgent, VerificationAgent, UnderwritingAgent, SanctionAgent

__all__ = ['MasterAgent', 'SalesAgent', 'VerificationAgent', 'UnderwritingAgent', 'SanctionAgent']
