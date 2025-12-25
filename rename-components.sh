#!/bin/bash
# Batch rename remaining components
# Phase 2-5: 14 more components

set -e  # Exit on error

echo "Starting batch component rename..."

# Phase 1 (continued): Home Cards - 5 more
echo "Phase 1: Home Cards..."
git mv src/components/home/FeaturedReviewsCard.tsx src/components/home/ReviewsFeaturedCard.tsx
git mv src/components/home/HistoricalEchoCard.tsx src/components/home/HistoryEchoCard.tsx
git mv src/components/home/MarketJudgmentCard.tsx src/components/home/MarketDecisionCard.tsx
git mv src/components/home/AIDecisionCard.tsx src/components/home/AIAnalysisCard.tsx
git mv src/components/home/ActionCard.tsx src/components/home/QuickActionCard.tsx

# Phase 2: Reviews
echo "Phase 2: Reviews..."
git mv src/components/reviews/ReviewCard.tsx src/components/reviews/EventCard.tsx
git mv src/components/reviews/EventLibraryClient.tsx src/components/reviews/ReviewsPageClient.tsx

# Phase 3: Calendar
echo "Phase 3: Calendar..."
git mv src/components/CalendarClient.tsx src/components/CalendarPageClient.tsx
git mv src/components/SingleEventClient.tsx src/components/EventDetailClient.tsx

# Phase 4: Quiz
echo "Phase 4: Quiz..."
git mv src/components/quiz/QuestionCard.tsx src/components/quiz/QuizQuestionCard.tsx
git mv src/components/quiz/ResultCard.tsx src/components/quiz/QuizResultCard.tsx

# Phase 5: Misc
echo "Phase 5: Misc..."
git mv src/components/ContentCard.tsx src/components/DeepDiveContentCard.tsx
git mv src/components/DecisionCard.tsx src/components/StrategyDecisionCard.tsx
git mv src/components/EvidenceCard.tsx src/components/ProofEvidenceCard.tsx

echo "✅ All files renamed successfully!"
