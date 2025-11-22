"use client";

import { useState } from "react";
import PlayIcon from "@/icons/PlayIcon";
import { getConfigSummary, getTimerCategoryDisplayName } from "@/lib/configure/utils";
import { PredefinedStylesProps, TimerCategory } from "@/types/configure";

import { ButtonLegacy, CardContainer } from "@/components/ui";

export const PredefinedStyles = ({
  styles,
  onSelectStyle,
  onStartTimer,
}: PredefinedStylesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<TimerCategory | "all">("all");

  const categories: Array<TimerCategory | "all"> = [
    "all",
    TimerCategory.CARDIO,
    TimerCategory.STRENGTH,
    TimerCategory.FLEXIBILITY,
    TimerCategory.SPORTS,
    TimerCategory.CUSTOM,
  ];

  const filteredStyles =
    selectedCategory === "all"
      ? styles
      : styles.filter((style) => style.category === selectedCategory);

  return (
    <CardContainer>
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Predefined Styles</h2>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <ButtonLegacy
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "All" : getTimerCategoryDisplayName(category)}
            </ButtonLegacy>
          ))}
        </div>
      </div>

      {filteredStyles.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600">No predefined styles found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStyles.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              onSelect={() => onSelectStyle(style)}
              onStart={() => onStartTimer(style.config)}
            />
          ))}
        </div>
      )}
    </CardContainer>
  );
};

interface StyleCardProps {
  style: PredefinedStylesProps["styles"][0];
  onSelect: () => void;
  onStart: () => void;
}

const StyleCard = ({ style, onSelect, onStart }: StyleCardProps) => {
  const handleCardClick = () => {
    onSelect();
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart();
  };

  return (
    <div
      className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{style.name}</h3>
          {style.isBuiltIn && (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">Built-in</span>
          )}
        </div>
        <p className="mb-2 text-sm text-gray-600">{style.description}</p>
        <p className="text-xs text-gray-500">{getConfigSummary(style.config)}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{getTimerCategoryDisplayName(style.category)}</span>
        <ButtonLegacy size="sm" onClick={handleStartClick} className="flex items-center gap-2">
          <PlayIcon className="h-4 w-4" />
          Start
        </ButtonLegacy>
      </div>
    </div>
  );
};
