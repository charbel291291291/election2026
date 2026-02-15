import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CATEGORY_EXPLANATIONS,
  hasCategoryBeenExplained,
  markCategoryAsExplained,
} from "../utils/categoryExplanations";

/**
 * Hook to handle category explanations on first visit
 */
export const useCategoryExplanation = () => {
  const location = useLocation();
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<{
    id: string;
    name: string;
    explanation: any;
  } | null>(null);

  useEffect(() => {
    // Map routes to category IDs
    const routeToCategory: Record<string, string> = {
      "/": "dashboard",
      "/field": "field",
      "/alerts": "alerts",
      "/resources": "resources",
      "/messages": "messages",
      "/whatsapp": "whatsapp",
      "/legal": "legal",
      "/simulation": "simulation",
      "/team": "team",
    };

    const categoryId = routeToCategory[location.pathname];
    if (!categoryId) return;

    // Check if category has been explained
    if (!hasCategoryBeenExplained(categoryId)) {
      const explanation = CATEGORY_EXPLANATIONS[categoryId];
      if (explanation) {
        // Get category name from route
        const categoryNames: Record<string, string> = {
          dashboard: "لوحة القيادة",
          field: "الميدان والمندوبين",
          alerts: "التنبيهات والمخاطر",
          resources: "الموارد والميزانية",
          messages: "الرسائل الانتخابية",
          whatsapp: "WhatsApp Intelligence",
          legal: "الذكاء الانتخابي",
          simulation: "محاكاة الحاصل",
          team: "إدارة الفريق",
        };

        setCurrentCategory({
          id: categoryId,
          name: categoryNames[categoryId] || categoryId,
          explanation,
        });
        setShowExplanation(true);
      }
    }
  }, [location.pathname]);

  const handleClose = () => {
    if (currentCategory) {
      markCategoryAsExplained(currentCategory.id);
    }
    setShowExplanation(false);
    setCurrentCategory(null);
  };

  return {
    showExplanation,
    currentCategory,
    handleClose,
  };
};
