from dataclasses import dataclass
from typing import Protocol


@dataclass
class RetrievalDocument:

    id: str

    text: str

    score: float


class Retriever(Protocol):

    def search(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[RetrievalDocument]:
        ...


class InMemoryRetriever:

    """
    Lightweight retrieval implementation.

    Later this can be replaced by:

    - FAISS
    - pgvector
    - Elasticsearch
    - OpenSearch
    """

    def __init__(
        self,
        documents=None,
    ):

        self.documents = (
            documents or []
        )

    def search(
        self,
        query: str,
        top_k: int = 5,
    ):

        query_tokens = set(
            query.lower().split()
        )

        scored = []

        for document in self.documents:

            document_tokens = set(
                document.text
                .lower()
                .split()
            )

            score = len(
                query_tokens
                & document_tokens
            )

            scored.append(
                RetrievalDocument(
                    id=document.id,
                    text=document.text,
                    score=float(score),
                )
            )

        return sorted(
            scored,
            key=lambda x: x.score,
            reverse=True,
        )[:top_k]