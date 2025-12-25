#!/bin/bash
# Update all imports and component references
# Must run AFTER rename-components.sh

set -e

echo "Updating imports and component names..."

# Function to update in files
update_files() {
  local old=$1
  local new=$2
  echo "  $old -> $new"
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/${old}/${new}/g" {} \;
}

echo "Phase 1: Home Cards..."
update_files "from '@/components/home/FeaturedReviewsCard'" "from '@/components/home/ReviewsFeaturedCard'"
update_files "from '@/components/home/HistoricalEchoCard'" "from '@/components/home/HistoryEchoCard'"
update_files "from '@/components/home/MarketJudgmentCard'" "from '@/components/home/MarketDecisionCard'"
update_files "from '@/components/home/AIDecisionCard'" "from '@/components/home/AIAnalysisCard'"
update_files "from '@/components/home/ActionCard'" "from '@/components/home/QuickActionCard'"

# Update component names
update_files "<FeaturedReviewsCard" "<ReviewsFeaturedCard"
update_files "</FeaturedReviewsCard>" "</ReviewsFeaturedCard>"
update_files "export function FeaturedReviewsCard" "export function ReviewsFeaturedCard"
update_files "interface FeaturedReviewsCardProps" "interface ReviewsFeaturedCardProps"

update_files "<HistoricalEchoCard" "<HistoryEchoCard"
update_files "</HistoricalEchoCard>" "</HistoryEchoCard>"
update_files "export function HistoricalEchoCard" "export function HistoryEchoCard"

update_files "<MarketJudgmentCard" "<MarketDecisionCard"
update_files "</MarketJudgmentCard>" "</MarketDecisionCard>"
update_files "export function MarketJudgmentCard" "export function MarketDecisionCard"

update_files "<AIDecisionCard" "<AIAnalysisCard"
update_files "</AIDecisionCard>" "</AIAnalysisCard>"
update_files "export function AIDecisionCard" "export function AIAnalysisCard"

update_files "<ActionCard" "<QuickActionCard"
update_files "</ActionCard>" "</QuickActionCard>"
update_files "export function ActionCard" "export function QuickActionCard"

echo "Phase 2: Reviews..."
update_files "from '@/components/reviews/ReviewCard'" "from '@/components/reviews/EventCard'"
update_files "from '@/components/reviews/EventLibraryClient'" "from '@/components/reviews/ReviewsPageClient'"

update_files "<ReviewCard" "<EventCard"
update_files "</ReviewCard>" "</EventCard>"
update_files "export function ReviewCard" "export function EventCard"

update_files "EventLibraryClient" "ReviewsPageClient"

echo "Phase 3: Calendar..."
update_files "from '@/components/CalendarClient'" "from '@/components/CalendarPageClient'"
update_files "from '@/components/SingleEventClient'" "from '@/components/EventDetailClient'"

update_files "CalendarClient" "CalendarPageClient"
update_files "SingleEventClient" "EventDetailClient"

echo "Phase 4: Quiz..."
update_files "from '@/components/quiz/QuestionCard'" "from '@/components/quiz/QuizQuestionCard'"
update_files "from '@/components/quiz/ResultCard'" "from '@/components/quiz/QuizResultCard'"

update_files "<QuestionCard" "<QuizQuestionCard"
update_files "</QuestionCard>" "</QuizQuestionCard>"
update_files "export function QuestionCard" "export function QuizQuestionCard"

update_files "<ResultCard" "<QuizResultCard"
update_files "</ResultCard>" "</QuizResultCard>"
update_files "export function ResultCard" "export function QuizResultCard"

echo "Phase 5: Misc..."
update_files "from '@/components/ContentCard'" "from '@/components/DeepDiveContentCard'"
update_files "from '@/components/DecisionCard'" "from '@/components/StrategyDecisionCard'"
update_files "from '@/components/EvidenceCard'" "from '@/components/ProofEvidenceCard'"

update_files "ContentCard" "DeepDiveContentCard"
update_files "DecisionCard" "StrategyDecisionCard"
update_files "EvidenceCard" "ProofEvidenceCard"

echo "✅ All imports and references updated!"
