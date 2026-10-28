"use client";

import Image from "next/image";
import { useState } from "react";
import { brandMark, type ProductExample } from "@/lib/tracker-media.mjs";
import { displayAgent } from "@/lib/report-ranking.mjs";

export function BrandMark({
  category,
  brand,
}: {
  category?: string;
  brand: string;
}) {
  const mark = brandMark(category, brand);
  const [failed, setFailed] = useState(false);
  if (!category) return null;
  return (
    <span
      className={`tracker-brand-mark ${mark?.dark && !failed ? "tracker-brand-mark-dark" : ""}`}
      aria-hidden="true"
    >
      {mark && !failed ? (
        <Image
          src={mark.src}
          width={40}
          height={40}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {brand
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")}
        </span>
      )}
    </span>
  );
}

function ProductPhoto({ product }: { product: ProductExample }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="tracker-product-photo">
      {failed ? (
        <span className="tracker-image-fallback">{product.brand}</span>
      ) : (
        <Image
          src={product.image}
          alt={product.alt}
          width={260}
          height={220}
          sizes="(max-width: 600px) 42vw, (max-width: 1000px) 28vw, 240px"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function ProductGallery({ products }: { products: ProductExample[] }) {
  if (!products.length) return null;
  return (
    <section
      id="product-examples"
      className="report-card tracker-product-section"
      aria-labelledby="product-examples-title"
    >
      <div className="tracker-product-intro">
        <div>
          <p className="eyebrow">From the captured answers</p>
          <h2 id="product-examples-title">Put a product to the name</h2>
        </div>
        <p>
          {products.length} selected products named in the comparison answers.
          Alphabetical, not a ranking. Mention totals above measure brands
          across all usable answers.
        </p>
      </div>
      <div className="tracker-product-grid">
        {products.map((product) => (
          <article className="tracker-product-card" key={product.id}>
            <ProductPhoto product={product} />
            <div className="tracker-product-copy">
              <p className="tracker-product-brand">{product.brand}</p>
              <h3>{product.name}</h3>
              <p className="tracker-product-source-label">
                Named in Prompt 3 by
              </p>
              <div className="tracker-answer-links">
                {product.evidence.map((e) => (
                  <a
                    key={e.answerId}
                    href={`#answer-${e.agent}-${e.promptNumber}`}
                    onClick={(event) => {
                      const answer = document.getElementById(
                        `answer-${e.agent}-${e.promptNumber}`,
                      );
                      if (answer instanceof HTMLDetailsElement) {
                        event.preventDefault();
                        answer.open = true;
                        history.pushState(
                          null,
                          "",
                          `#answer-${e.agent}-${e.promptNumber}`,
                        );
                        answer.scrollIntoView({ block: "start" });
                        answer
                          .querySelector("summary")
                          ?.focus({ preventScroll: true });
                      }
                    }}
                  >
                    {displayAgent(e.agent)}
                    <span className="sr-only">
                      {" "}
                      answer mentioning {product.brand} {product.name}
                    </span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ))}
              </div>
              <a
                className="tracker-manufacturer-link"
                href={product.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                Manufacturer &amp; image source
                <span className="sr-only">
                  {" "}
                  for {product.brand} {product.name} (opens in a new tab)
                </span>{" "}
                ↗
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="tracker-product-note">
        Manufacturer photos are reference examples; versions, colors, flavors,
        packaging and sizes may differ from details unspecified in an answer.
        Images identify products, not verified claims or Recoscope endorsements.
      </p>
    </section>
  );
}

export function AnswerProducts({
  products,
  answerId,
}: {
  products: ProductExample[];
  answerId: number;
}) {
  const named = products.filter((p) =>
    p.evidence.some((e) => e.answerId === answerId),
  );
  if (!named.length) return null;
  return (
    <div
      className="answer-product-examples"
      aria-label="Pictured products named in this answer"
    >
      {named.map((p) => (
        <a key={p.id} href="#product-examples" className="answer-product-thumb">
          <Image
            src={p.image}
            alt={p.alt}
            width={64}
            height={64}
            loading="lazy"
          />
          <span>
            {p.brand}
            <small>{p.name}</small>
          </span>
        </a>
      ))}
    </div>
  );
}
