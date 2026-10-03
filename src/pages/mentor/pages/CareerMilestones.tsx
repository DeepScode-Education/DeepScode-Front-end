import React from "react";
import type { CareerMilestone } from "@/types/mentor";

export type Milestone = CareerMilestone;

interface CareerMilestonesProps {
  heading?: string;
  subheading?: string;
  milestones: Milestone[];
}

const CareerMilestones: React.FC<CareerMilestonesProps> = ({
  heading = "Career Milestones",
  subheading = "A journey through leading studios and independent ventures.",
  milestones,
}) => {
  return (
    <section className="cm-section">
      <div className="cm-header">
        <h2 className="cm-heading">{heading}</h2>
        <p className="cm-subheading">{subheading}</p>
      </div>

      <div className="cm-timeline">
        <div className="cm-line" />

        {milestones.map((m, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div className="cm-row" key={i}>
              <div className={`cm-side cm-side-left ${isLeft ? "cm-visible" : ""}`}>
                {isLeft && <MilestoneCard milestone={m} align="right" />}
              </div>

              <div className="cm-marker">
                <span className="cm-dot" />
              </div>

              <div className={`cm-side cm-side-right ${!isLeft ? "cm-visible" : ""}`}>
                {!isLeft && <MilestoneCard milestone={m} align="left" />}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .cm-section {
          background: #f4f5f7;
          padding: 64px 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
        }
        .cm-header {
          text-align: center;
          margin-bottom: 56px;
        }
        .cm-heading {
          font-size: 32px;
          font-weight: 800;
          color: #1a1d29;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }
        .cm-subheading {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
        }
        .cm-timeline {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }
        .cm-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #d1d5db;
          transform: translateX(-50%);
        }
        .cm-row {
          position: relative;
          display: flex;
          align-items: flex-start;
          min-height: 110px;
        }
        .cm-side {
          width: 50%;
        }
        .cm-side-left {
          padding-right: 40px;
        }
        .cm-side-right {
          padding-left: 40px;
        }
        .cm-marker {
          position: absolute;
          left: 50%;
          top: 6px;
          transform: translateX(-50%);
          z-index: 2;
        }
        .cm-dot {
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4f46e5;
          box-shadow: 0 0 0 4px #f4f5f7;
        }
        .cm-card {
          max-width: 380px;
        }
        .cm-card.align-right {
          margin-left: auto;
          text-align: right;
        }
        .cm-card.align-left {
          margin-right: auto;
          text-align: left;
        }
        .cm-period {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #4f46e5;
          text-transform: uppercase;
          margin: 0 0 6px;
        }
        .cm-title {
          font-size: 19px;
          font-weight: 800;
          color: #1a1d29;
          margin: 0 0 4px;
        }
        .cm-company {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 8px;
        }
        .cm-description {
          font-size: 13.5px;
          line-height: 1.5;
          color: #6b7280;
          margin: 0;
        }

        @media (max-width: 720px) {
          .cm-timeline .cm-line {
            left: 16px;
          }
          .cm-row {
            min-height: 0;
            padding-bottom: 32px;
          }
          .cm-marker {
            left: 16px;
          }
          .cm-side-left {
            display: none;
          }
          .cm-side-right {
            width: 100%;
            padding-left: 40px;
            display: block !important;
          }
          .cm-card.align-right,
          .cm-card.align-left {
            text-align: left;
            margin: 0;
          }
        }
      `}</style>
    </section>
  );
};

const MilestoneCard: React.FC<{ milestone: Milestone; align: "left" | "right" }> = ({
  milestone,
  align,
}) => (
  <div className={`cm-card align-${align}`}>
    <p className="cm-period">{milestone.period}</p>
    <h3 className="cm-title">{milestone.title}</h3>
    <p className="cm-company">{milestone.company}</p>
    <p className="cm-description">{milestone.description}</p>
  </div>
);

export default CareerMilestones;