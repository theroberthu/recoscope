import type { ReactNode } from "react";
import type { Coverage } from "@/lib/report-ranking.mjs";
import type { ReportBriefEvidence, BriefMetric } from "@/lib/report-brief.mjs";
import type { BenchmarkVideo } from "@/lib/benchmark-video.mjs";
import marks from "@/lib/home-brand-marks.json";
import { SectionHeader } from "./SectionHeader";
import { BriefVideoLink } from "./BriefVideoLink";

function EvidenceCard({ metric, ranking = false }: { metric: BriefMetric; ranking?: boolean }) {
  const name = metric.names.join(" / ");
  const mark = metric.names.length === 1
    ? (marks as Record<string, { src: string; dark?: boolean }>)[metric.names[0]]
    : null;
  return (
    <div className="report-brief-metric">
      <dt>{ranking ? "First-place ranks" : "Mention frequency"}</dt>
      <dd>
        <span className={`report-brief-brand${mark?.dark ? " is-dark" : ""}`}>
          {mark ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mark.src} alt="" width={90} height={24} />
            <span className="sr-only">{name}</span>
          </> : <span>{name || (ranking ? "No recorded first place" : "No recorded mentions")}</span>}
        </span>
        <strong>{metric.count}<span>/{metric.total}</span></strong>
        <span className="report-brief-metric-caption">
          {ranking ? "ranked comparisons" : "usable answers"}
          {metric.names.length > 1 ? " each · tied" : ""}
        </span>
      </dd>
    </div>
  );
}

export function ReportOpening({ category, date, dateLabel, cadence, coverage, promptCount, models, headline, evidence, video, warnings, history }: {
  category: string; date: string; dateLabel: string; cadence: string;
  coverage: Coverage; promptCount: number; models: string;
  headline: string; evidence: ReportBriefEvidence; video: BenchmarkVideo | null;
  warnings?: ReactNode; history?: ReactNode;
}) {
  const attribution = <>Research by <a href="/about">Robert Hu</a> · Published by RecoScope</>;
  return <>
    <header className="report-hero">
      <div className="report-identity">
        <p className="report-mobile-date">AI benchmark · <time dateTime={date}>{dateLabel}</time></p>
        <SectionHeader title={category} subtitle={`${cadence} — ${dateLabel}`} />
        <p className="report-models report-attribution-desktop">{attribution} · Collected <time dateTime={date}>{dateLabel}</time></p>
      </div>
      <div className="report-brief">
        <h2 className="report-brief-headline">{video?.title ?? headline}</h2>
        <dl className="report-brief-evidence">
          <EvidenceCard metric={evidence.mentions} />
          {evidence.firstPlaces.total > 0
            ? <EvidenceCard metric={evidence.firstPlaces} ranking />
            : <div className="report-brief-unranked"><dt>Comparative rank</dt><dd>No explicit ranking recorded.</dd></div>}
        </dl>
        {evidence.unranked > 0 && <p className="report-brief-rank-note">{evidence.unranked} usable comparison{evidence.unranked === 1 ? " was" : "s were"} unranked and {evidence.unranked === 1 ? "is" : "are"} excluded from the rank denominator.</p>}
        <p className="report-brief-context">{coverage.eligible} usable answers · {coverage.models.length} assistants · {promptCount} prompt types</p>
        <p className="report-brief-assistants">{models}</p>
        {video && <BriefVideoLink video={video} />}
        <a className="report-brief-compare" href="#model-comparison">Compare the AI answers <span aria-hidden="true">↗</span></a>
        <p className="report-brief-limitation">Captured answers, not a product-quality score.</p>
      </div>
      <div className="report-coverage">
        <dl className="report-stats">
          <div><dt>Usable answers</dt><dd>{coverage.eligible}<span>/{coverage.captured}</span></dd></div>
          <div><dt>Models</dt><dd>{coverage.models.length}</dd></div>
          <div><dt>Prompt types</dt><dd>{promptCount}</dd></div>
        </dl>
        <p className="report-models report-model-list">Included: {models}</p>
        {warnings}
      </div>
    </header>
    <div className="report-source-row">
      <p className="report-attribution-mobile">{attribution}</p>
      {history}
    </div>
  </>;
}
