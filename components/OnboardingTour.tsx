import React, { useState, useCallback } from "react";
import Joyride, { Step } from "react-joyride";
import { useStore } from "../store/useStore";

// Tour configuration - Lebanese Election Campaign SaaS (Arabic)
const TOUR_STEPS: Step[] = [
  {
    target: "body",
    content: (
      <div className="text-center px-2">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          مرحباً بك في منصة FieldOps
        </h2>
        <p className="text-slate-600 text-sm">
          منصة إدارة الحملات الانتخابية المتكاملة. دعنا نأخذك في جولة سريعة!
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          لوحة القيادة KPI
        </h3>
        <p className="text-slate-600 text-sm">
          عرض مؤشرات الأداء الرئيسية للحملة في الوقت الفعلي، الإنذارات، ومعدلات
          التفاعل.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="districts"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">إدارة الدوائر</h3>
        <p className="text-slate-600 text-sm">
          إدارة الدوائر electorale، تتبع المرشحين، ورصد النتائج في كل دائرة
          انتخابية.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="candidates"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          إدارة المرشحين
        </h3>
        <p className="text-slate-600 text-sm">
          ملفات المرشحين، الإحصائيات، والاطلاع على التفضيلات electorate لكل
          مرشح.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="volunteers"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          إدارة المتطوعين
        </h3>
        <p className="text-slate-600 text-sm">
          تنسيق المتطوعين، توزيع المهام، وتتبع أنشطتهم الميدانية.
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: '[data-tour="analytics"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          التحليلات والبيانات
        </h3>
        <p className="text-slate-600 text-sm">
          تحليلات معمقة، رسوم بيانية، وتوقعات نتائج electorate مبنية على
          البيانات.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="messaging"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">أدوات الرسائل</h3>
        <p className="text-slate-600 text-sm">
          إرسال رسائل جماعية عبر واتساب، استطلاعات، ومتابعة الناخبين.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="security"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          الأمان والصلاحيات
        </h3>
        <p className="text-slate-600 text-sm">
          إدارة أدوار المستخدمين، صلاحيات الوصول، وسجلات النشاط لأمان النظام.
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: "body",
    content: (
      <div className="text-center px-2">
        <h2 className="text-xl font-bold text-slate-900 mb-2">أنت جاهز!</h2>
        <p className="text-slate-600 text-sm">
          ابدأ بإدارة حملتك electorate الآن. المساعدة متاحة عبر زر الواتساب.
        </p>
      </div>
    ),
    placement: "center",
  },
];

// Custom tooltip component with step counter
const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  isLastStep,
}: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-sm">
      <div className="text-slate-800">{step.content}</div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <button
          {...backProps}
          disabled={index === 0}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            index === 0
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          السابق
        </button>
        <span className="text-xs text-slate-400 font-medium">
          {index + 1} / {TOUR_STEPS.length}
        </span>
        <div className="flex gap-2">
          <button
            {...closeProps}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            تخطي
          </button>
          <button
            {...primaryProps}
            className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
          >
            {isLastStep ? "إنهاء" : "التالي"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom beacon for spotlight
const CustomBeacon = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>
    <div className="relative bg-red-600 rounded-full p-3 shadow-xl">
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    </div>
  </div>
);

interface OnboardingTourProps {
  run?: boolean;
  onFinish?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  run: externalRun,
  onFinish,
}) => {
  const [runInternal, setRunInternal] = useState(false);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // Check if tour should run (first visit + authenticated)
  const shouldRun = useCallback(() => {
    if (externalRun !== undefined) return externalRun;

    const hasSeenTour = localStorage.getItem("fieldops_tour_completed");
    return !hasSeenTour && isAuthenticated;
  }, [externalRun, isAuthenticated]);

  // Handle joyride callbacks
  const handleJoyrideCallback = useCallback(
    (data: { status: string; type: string }) => {
      const { status } = data;

      // Mark tour as completed when finished or skipped
      if (status === "finished" || status === "skipped") {
        localStorage.setItem("fieldops_tour_completed", "true");
        setRunInternal(false);
        onFinish?.();
      }
    },
    [onFinish]
  );

  // Start tour manually (can be triggered from settings)
  const startTour = useCallback(() => {
    localStorage.removeItem("fieldops_tour_completed");
    setRunInternal(true);
  }, []);

  // Reset tour (for testing or re-onboarding)
  const resetTour = useCallback(() => {
    localStorage.removeItem("fieldops_tour_completed");
    setRunInternal(true);
  }, []);

  // Export functions to window for external access
  if (typeof window !== "undefined") {
    (window as any).startOnboardingTour = startTour;
    (window as any).resetOnboardingTour = resetTour;
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={shouldRun() || runInternal}
      continuous
      showSkipButton
      showProgress
      floaterProps={{
        disableAnimation: true,
      }}
      beaconComponent={CustomBeacon}
      tooltipComponent={CustomTooltip}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#dc2626",
          backgroundColor: "#ffffff",
          textColor: "#1e293b",
          arrowColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.8)",
          beaconSize: 48,
        },
        tooltip: {
          borderRadius: 16,
        },
      }}
      locale={{
        last: "إنهاء",
        skip: "تخطي",
        next: "التالي",
        back: "السابق",
      }}
    />
  );
};

// Export utility functions for manual control
export const startOnboardingTour = () => {
  if (typeof window !== "undefined" && (window as any).startOnboardingTour) {
    (window as any).startOnboardingTour();
  }
};

export const resetOnboardingTour = () => {
  if (typeof window !== "undefined" && (window as any).resetOnboardingTour) {
    (window as any).resetOnboardingTour();
  }
};

export default OnboardingTour;
