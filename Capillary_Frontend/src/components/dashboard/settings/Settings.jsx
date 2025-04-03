import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Building2,
  Database,
  GitBranch,
  Coins,
  Clock,
  CreditCard,
  ScrollText,
  Settings as SettingsIcon,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "Integrations",
      description: "Configure third-party service connections",
      items: [
        {
          title: "Google SSO",
          icon: Users,
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
          description: "Single sign-on configuration",
          path: "/settings/google-sso",
        },
        {
          title: "SMTP",
          icon: Mail,
          bgColor: "bg-purple-50",
          textColor: "text-purple-600",
          description: "Email server settings",
          path: "/settings/smtp",
        },
        {
          title: "REST API",
          icon: Building2,
          bgColor: "bg-indigo-50",
          textColor: "text-indigo-600",
          description: "HR system integration",
          path: "/settings/create-rest-api",
        },
        {
          title: "Email Notification",
          icon: Database,
          bgColor: "bg-cyan-50",
          textColor: "text-cyan-600",
          description: "Enable disable Email notification",
          path: "/settings/email-notification",
        },
        {
          title: "Approver Type",
          icon: GitBranch,
          bgColor: "bg-primary/10",
          textColor: "text-primary",
          description: "Configure approval workflows",
          path: "/settings/approver-type",
        },
      ],
    },
    // {
    //   title: "Business Settings",
    //   description: "Manage core business configurations",
    //   items: [
    //     {
    //       title: "Approval Flow",
    //       icon: GitBranch,
    //       bgColor: "bg-primary/10",
    //       textColor: "text-primary",
    //       description: "Configure approval workflows",
    //       path: "/settings/approval-flow",
    //     },
        
    //     {
    //       title: "Currency",
    //       icon: Coins,
    //       bgColor: "bg-amber-50",
    //       textColor: "text-amber-600",
    //       description: "Set currency preferences",
    //       path: "/settings/currency",
    //     },
    //     {
    //       title: "Payment Terms",
    //       icon: Clock,
    //       bgColor: "bg-rose-50",
    //       textColor: "text-rose-600",
    //       description: "Define payment schedules",
    //       path: "/settings/payment-terms",
    //     },
    //     {
    //       title: "Payment Type",
    //       icon: CreditCard,
    //       bgColor: "bg-emerald-50",
    //       textColor: "text-emerald-600",
    //       description: "Configure payment methods",
    //       path: "/settings/payment-type",
    //     },
    //   ],
    // },
    // {
    //   title: "System",
    //   description: "System monitoring and logs",
    //   items: [
    //     {
    //       title: "Logs",
    //       icon: ScrollText,
    //       bgColor: "bg-slate-50",
    //       textColor: "text-slate-600",
    //       description: "View system logs",
    //       path: "/settings/system-logs",
    //     },
    //   ],
    // },
  ];

  const StatCard = ({
    title,
    icon: Icon,
    bgColor,
    textColor,
    description,
    path,
    onClick,
  }) => (
    <div
      onClick={() => navigate(path)}
      className={`${bgColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex items-center space-x-4">
        <div className={`${textColor} bg-white p-3 rounded-lg shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center space-x-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-12">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {group.title}
              </h2>
              <p className="text-gray-500 mt-1">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((item, index) => (
                <StatCard key={index} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
