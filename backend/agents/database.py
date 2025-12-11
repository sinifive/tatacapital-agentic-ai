"""
Database initialization and session management for agent orchestration.
"""
import sqlite3
import os
from datetime import datetime
from typing import Optional, Dict, Any

DATABASE_FILE = "tatacapital_sessions.db"

def init_database():
    """
    Initialize SQLite database with sessions and session_state tables.
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Create sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            customer_name TEXT,
            phone TEXT,
            email TEXT,
            loan_amount REAL,
            current_agent TEXT,
            status TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            last_activity TIMESTAMP,
            kyc_failures INTEGER DEFAULT 0,
            escalated_to_human INTEGER DEFAULT 0,
            abandonment_timeout INTEGER DEFAULT 0
        )
    ''')
    
    # Create session_state table to track agent workflows
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS session_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            agent_name TEXT,
            action TEXT,
            data TEXT,
            timestamp TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        )
    ''')
    
    # Create documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            doc_type TEXT,
            file_path TEXT,
            uploaded_at TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        )
    ''')
    
    # Create events table for audit logging
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS session_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            event_type TEXT,
            agent_name TEXT,
            message_text TEXT,
            user_input TEXT,
            status TEXT,
            timestamp TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        )
    ''')
    
    # Create escalations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS escalations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            reason TEXT,
            details TEXT,
            escalated_at TIMESTAMP,
            resolved_at TIMESTAMP,
            resolved_by TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve session data from database.
    
    Args:
        session_id: Unique session identifier
        
    Returns:
        Dictionary with session data or None if not found
    """
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM sessions WHERE session_id = ?', (session_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def create_session(session_id: str, customer_name: str = None) -> bool:
    """
    Create a new session in database.
    
    Args:
        session_id: Unique session identifier
        customer_name: Optional customer name
        
    Returns:
        True if successful, False if session already exists
    """
    if get_session(session_id):
        return False
    
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO sessions 
        (session_id, customer_name, current_agent, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (session_id, customer_name, 'SalesAgent', 'active', now, now))
    
    conn.commit()
    conn.close()
    return True

def update_session(session_id: str, **kwargs) -> bool:
    """
    Update session fields.
    
    Args:
        session_id: Session identifier
        **kwargs: Fields to update (customer_name, phone, email, loan_amount, current_agent, status)
        
    Returns:
        True if successful
    """
    allowed_fields = {'customer_name', 'phone', 'email', 'loan_amount', 'current_agent', 'status'}
    fields_to_update = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    if not fields_to_update:
        return False
    
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    set_clause = ', '.join([f"{k} = ?" for k in fields_to_update.keys()])
    values = list(fields_to_update.values()) + [datetime.now().isoformat(), session_id]
    
    cursor.execute(f'''
        UPDATE sessions 
        SET {set_clause}, updated_at = ?
        WHERE session_id = ?
    ''', values)
    
    conn.commit()
    conn.close()
    return True

def log_state_transition(session_id: str, agent_name: str, action: str, data: str = None):
    """
    Log state transition for audit and debugging.
    
    Args:
        session_id: Session identifier
        agent_name: Name of agent executing action
        action: Action description
        data: Optional JSON data
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO session_state (session_id, agent_name, action, data, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (session_id, agent_name, action, data, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()


def log_event(session_id: str, event_type: str, agent_name: str, message_text: str, 
              user_input: str = None, status: str = 'normal') -> int:
    """
    Log event to session_events table for audit trail.
    
    Args:
        session_id: Session identifier
        event_type: Type of event (message, kyc_failure, escalation, negotiation, etc.)
        agent_name: Name of agent handling event
        message_text: Message content
        user_input: User input (if any)
        status: Event status (normal, warning, error, escalation)
        
    Returns:
        Event ID
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO session_events 
        (session_id, event_type, agent_name, message_text, user_input, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (session_id, event_type, agent_name, message_text, user_input, status, datetime.now().isoformat()))
    
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    
    return event_id


def get_session_events(session_id: str, event_type: str = None) -> list:
    """
    Retrieve events for a session, optionally filtered by type.
    
    Args:
        session_id: Session identifier
        event_type: Optional event type filter
        
    Returns:
        List of event records
    """
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if event_type:
        cursor.execute(
            'SELECT * FROM session_events WHERE session_id = ? AND event_type = ? ORDER BY timestamp DESC',
            (session_id, event_type)
        )
    else:
        cursor.execute(
            'SELECT * FROM session_events WHERE session_id = ? ORDER BY timestamp DESC',
            (session_id,)
        )
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def escalate_session(session_id: str, reason: str, details: str = None) -> int:
    """
    Create escalation record and flag session.
    
    Args:
        session_id: Session identifier
        reason: Escalation reason
        details: Additional details
        
    Returns:
        Escalation ID
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Create escalation record
    cursor.execute('''
        INSERT INTO escalations (session_id, reason, details, escalated_at)
        VALUES (?, ?, ?, ?)
    ''', (session_id, reason, details, datetime.now().isoformat()))
    
    escalation_id = cursor.lastrowid
    
    # Update session flag
    cursor.execute('''
        UPDATE sessions 
        SET escalated_to_human = 1, status = 'escalated'
        WHERE session_id = ?
    ''', (session_id,))
    
    conn.commit()
    conn.close()
    
    return escalation_id


def get_escalations(session_id: str) -> list:
    """
    Get escalation records for session.
    
    Args:
        session_id: Session identifier
        
    Returns:
        List of escalation records
    """
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT * FROM escalations WHERE session_id = ? ORDER BY escalated_at DESC',
        (session_id,)
    )
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def increment_kyc_failures(session_id: str) -> int:
    """
    Increment KYC failure counter for session.
    
    Args:
        session_id: Session identifier
        
    Returns:
        New failure count
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE sessions 
        SET kyc_failures = kyc_failures + 1
        WHERE session_id = ?
    ''', (session_id,))
    
    conn.commit()
    
    # Get updated count
    cursor.execute('SELECT kyc_failures FROM sessions WHERE session_id = ?', (session_id,))
    result = cursor.fetchone()
    conn.close()
    
    return result[0] if result else 0


def check_abandonment(session_id: str, timeout_seconds: int = 900) -> bool:
    """
    Check if session has been abandoned (no activity for timeout period).
    
    Args:
        session_id: Session identifier
        timeout_seconds: Timeout in seconds (default 15 minutes)
        
    Returns:
        True if abandoned, False otherwise
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT updated_at FROM sessions WHERE session_id = ?',
        (session_id,)
    )
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        return False
    
    from datetime import timedelta
    last_activity = datetime.fromisoformat(result[0])
    time_elapsed = datetime.now() - last_activity
    
    return time_elapsed > timedelta(seconds=timeout_seconds)
