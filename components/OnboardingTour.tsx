import React, { useState, useCallback } from "react";
import Joyride, { Step } from "react-joyride";
import { useStore } from "../store/useStore";

// Tour configuration - Lebanese Election Campaign SaaS (Arabic)
// Covers: Hamburger, Footer, CTA, Categories, Dashboard, AI Advisor, Reports, Profile
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
    target: '[data-tour="hamburger-menu"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">القائمة الرئيسية</h3>
        <p className="text-slate-600 text-sm">
          اضغط هنا لفتح القائمة الكاملة: لوحة القيادة، الفئات، الإعدادات، والملف الشخصي.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="cta-button"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">المساعد الذكي (AI)</h3>
        <p className="text-slate-600 text-sm">
          اضغط لفتح العميد - مساعدك الذكي. اسأل عن التقارير، التنبيهات، والقانون الانتخابي.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="footer-nav"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">إضافة تقرير</h3>
        <p className="text-slate-600 text-sm">
          الزر الرئيسي لإضافة تقرير ميداني جديد بسرعة.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="footer-profile"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">الملف الشخصي والإعدادات</h3>
        <p className="text-slate-600 text-sm">
          الوصول للقائمة الكاملة والملف الشخصي وإعدادات الحساب.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          لوحة القيادة
        </h3>
        <p className="text-slate-600 text-sm">
          عرض مؤشرات الأداء الرئيسية (KPIs) للحملة في الوقت الفعلي، التنبيهات النشطة،
          نسبة الاقتراع، وخريطة العمليات المباشرة.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: false,
  },
  {
    target: '[data-tour="field-input"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          الميدان والمندوبين
        </h3>
        <p className="text-slate-600 text-sm">
          إدارة التقارير الميدانية من المندوبين، تتبع الأنشطة الانتخابية، وتسجيل
          البيانات من مراكز الاقتراع.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="whatsapp"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          WhatsApp Intelligence
        </h3>
        <p className="text-slate-600 text-sm">
          نظام ذكي لإدارة الاتصالات عبر واتساب مع أوامر نصية تلقائية، استطلاعات،
          ورسائل جماعية.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="legal"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          AI Legal Advisor
        </h3>
        <p className="text-slate-600 text-sm">
          اسأل أسئلة حول القانون الانتخابي اللبناني 44/2017 واحصل على إجابات قانونية
          منظمة مدعومة بـ Gemini AI.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="team"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">إدارة الفريق</h3>
        <p className="text-slate-600 text-sm">
          إدارة أعضاء الفريق، الصلاحيات، وإعدادات الحسابات. متاح فقط للمديرين.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="cta-button"], [data-tour="ai-assistant"]',
    content: (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">AI Legal Advisor</h3>
        <p className="text-slate-600 text-sm">
          اسأل أسئلة حول القانون الانتخابي اللبناني 44/2017 واحصل على إجابات مدعومة بـ Gemini AI.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: "body",
    content: (
      <div className="text-center px-2">
        <h2 className="text-xl font-bold text-slate-900 mb-2">النظام جاهز</h2>
        <p className="text-slate-600 text-sm">
          Your system is ready. Let&apos;s begin.
        </p>
      </div>
    ),
    placement: "center",
  },
];

// Custom tooltip component with step counter - Mobile optimized
const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  isLastStep,
}: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-[90vw] md:max-w-sm mx-4">
      <div className="text-slate-800 text-sm md:text-base">{step.content}</div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between sm:justify-start gap-2 order-2 sm:order-1">
          <button
            {...backProps}
            disabled={index === 0}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors flex-1 sm:flex-none ${
              index === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            السابق
          </button>
          <span className="text-xs text-slate-400 font-medium px-2">
            {index + 1} / {TOUR_STEPS.length}
          </span>
        </div>
        <div className="flex gap-2 order-1 sm:order-2">
          <button
            {...closeProps}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg"
          >
            تخطي
          </button>
          <button
            {...primaryProps}
            className="px-4 md:px-5 py-2 text-xs md:text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
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
      scrollToFirstStep
      disableScrolling={false}
      floaterProps={{
        disableAnimation: false,
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
          overlayColor: "rgba(0, 0, 0, 0.85)",
          beaconSize: 48,
        },
        tooltip: {
          borderRadius: 16,
          padding: 0,
        },
        tooltipContainer: {
          textAlign: "right",
        },
        overlay: {
          mixBlendMode: "normal",
        },
        spotlight: {
          borderRadius: 12,
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
