from enum import Enum


class SurgeryStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    PREPPED = "PREPPED"
    ANESTHESIA_INDUCED = "ANESTHESIA_INDUCED"
    IN_PROCEDURE = "IN_PROCEDURE"
    POST_OP = "POST_OP"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class TriageLevel(int, Enum):
    IMMEDIATE = 1        # Life-threatening
    URGENT = 2           # Risk of deterioration
    TIME_SENSITIVE = 3   # Needs surgery, stable
    ELECTIVE = 4
    NON_URGENT = 5
