import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { joinList, percent, pluralize } from "./breedData";

const COLORS = ["#c98b4b", "#e8b64c", "#9bb08a", "#f08a7e", "#7c9168", "#a86d33", "#8fbfc7", "#5a3d2b"];
const AXIS_TICK = { fill: "#5a3d2b", fontSize: 12 };
const TOP_BARS = 10;
const TOP_SLICES = 5;

function ViewToggle({ label, options, value, onChange }) {
  return (
    <div className="view-toggle" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={value === option.value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, toggle, caption, children }) {
  return (
    <article className="chart-card">
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {toggle}
      </div>
      <div className="chart-body">{children}</div>
      <p className="chart-caption">
        <strong>What to notice:</strong> {caption}
      </p>
    </article>
  );
}

function FamilyChart({ insights, onPickFamily }) {
  const [view, setView] = useState("bar");
  const { withSubs, averageSubs, subBreedCount, maxSubs, largestFamilies, topThree, topThreeShare } =
    insights;

  const barData = withSubs
    .slice(0, TOP_BARS)
    .map((f) => ({ name: f.label, family: f.family, subBreeds: f.subCount }));

  const pieData = withSubs.slice(0, TOP_SLICES).map((f) => ({ name: f.label, value: f.subCount }));
  const otherFamilies = withSubs.slice(TOP_SLICES);
  if (otherFamilies.length > 0) {
    pieData.push({
      name: `${otherFamilies.length} other ${pluralize(otherFamilies.length, "family", "families")}`,
      value: otherFamilies.reduce((sum, f) => sum + f.subCount, 0),
    });
  }

  const leaders = largestFamilies.map((f) => f.label);
  const leadText =
    leaders.length === 1
      ? `${leaders[0]} leads with ${maxSubs} sub-breeds`
      : `${joinList(leaders)} tie for the lead with ${maxSubs} sub-breeds each`;

  const caption =
    view === "bar"
      ? `${leadText}. The dashed line marks the average of ${averageSubs.toFixed(1)} sub-breeds per family that has any. Click a bar to filter the gallery to that family.`
      : `${joinList(topThree.map((f) => f.label))} together hold ${topThreeShare}% of all ${subBreedCount} sub-breeds.`;

  return (
    <ChartCard
      title="Where the sub-breeds live"
      subtitle={
        view === "bar"
          ? `Top ${Math.min(TOP_BARS, withSubs.length)} families by number of sub-breeds`
          : "Share of all sub-breeds, by family"
      }
      toggle={
        <ViewToggle
          label="Switch chart type for sub-breeds"
          value={view}
          onChange={setView}
          options={[
            { value: "bar", label: "Bars" },
            { value: "pie", label: "Pie" },
          ]}
        />
      }
      caption={caption}
    >
      {withSubs.length === 0 ? (
        <p className="chart-empty">No sub-breeds in this dataset.</p>
      ) : view === "bar" ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} layout="vertical" margin={{ top: 22, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
            <YAxis type="category" dataKey="name" width={96} tick={AXIS_TICK} />
            <Tooltip cursor={{ fill: "rgba(232, 182, 76, 0.18)" }} />
            <ReferenceLine
              x={averageSubs}
              stroke="#a86d33"
              strokeDasharray="5 4"
              label={{ value: `Avg ${averageSubs.toFixed(1)}`, position: "top", fill: "#a86d33", fontSize: 12 }}
            />
            <Bar
              dataKey="subBreeds"
              name="Sub-breeds"
              radius={[0, 8, 8, 0]}
              cursor="pointer"
              onClick={(entry) => {
                const family = entry?.family ?? entry?.payload?.family;
                if (family && onPickFamily) onPickFamily(family);
              }}
            >
              {barData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="75%" label>
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function MakeupChart({ insights }) {
  const [view, setView] = useState("mix");
  const { standaloneCount, withSubs, familyCount, distribution, maxSubs } = insights;

  const mixData = [
    { name: "No sub-breeds", value: standaloneCount },
    { name: "Has sub-breeds", value: withSubs.length },
  ];

  const mostFamilies = Math.max(...distribution.map((d) => d.families));
  const modes = distribution.filter((d) => d.families === mostFamilies);
  const modeText =
    modes.length === 1
      ? modes[0].subs === 0
        ? `Having no sub-breeds is the most common setup (${mostFamilies} families).`
        : `${modes[0].subs} ${pluralize(modes[0].subs, "sub-breed")} is the most common family size (${mostFamilies} families).`
      : `Family sizes run from no sub-breeds up to ${maxSubs}.`;

  const caption =
    view === "mix"
      ? `${standaloneCount} of ${familyCount} families (${percent(standaloneCount, familyCount)}%) have no sub-breeds at all.`
      : modeText;

  return (
    <ChartCard
      title="How families are built"
      subtitle={
        view === "mix"
          ? "Families with and without sub-breeds"
          : "How many families have each number of sub-breeds"
      }
      toggle={
        <ViewToggle
          label="Switch chart type for family makeup"
          value={view}
          onChange={setView}
          options={[
            { value: "mix", label: "Split" },
            { value: "sizes", label: "Sizes" },
          ]}
        />
      }
      caption={caption}
    >
      {view === "mix" ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={mixData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="75%" paddingAngle={3} label>
              <Cell fill="#9bb08a" />
              <Cell fill="#c98b4b" />
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} margin={{ top: 16, right: 16, bottom: 28, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              label={{ value: "Sub-breeds in the family", position: "insideBottom", offset: -16, fill: "#8a7566", fontSize: 12 }}
            />
            <YAxis allowDecimals={false} tick={AXIS_TICK} />
            <Tooltip cursor={{ fill: "rgba(232, 182, 76, 0.18)" }} />
            <Bar dataKey="families" name="Families" fill="#e8b64c" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function buildPresets(insights) {
  const { standaloneCount, withSubs, subBreedCount, maxSubs, averageSubs, largestFamilies } = insights;
  const presets = [];

  if (withSubs.length > 0) {
    const leader = largestFamilies[0];
    const threshold = Math.min(maxSubs, Math.max(2, Math.ceil(averageSubs)));
    const bigFamilies = withSubs.filter((f) => f.subCount >= threshold);

    presets.push({
      id: "subs",
      label: "Sub-breeds only",
      hint: `All ${subBreedCount} sub-breeds`,
      filters: { type: "sub" },
    });
    presets.push({
      id: "largest",
      label: `The ${leader.label} family`,
      hint: `${leader.subCount} sub-breeds`,
      filters: { family: leader.family },
    });
    presets.push({
      id: "big",
      label: `Big families (${threshold}+ varieties)`,
      hint: `${bigFamilies.length} ${pluralize(bigFamilies.length, "family", "families")}`,
      filters: { type: "sub", min: threshold },
    });
  }

  presets.push({
    id: "standalone",
    label: "Standalone breeds",
    hint: `${standaloneCount} ${pluralize(standaloneCount, "breed")}`,
    filters: { type: "standalone" },
  });

  return presets;
}

export function InsightsSection({ insights, loading, onApplyPreset, onPickFamily }) {
  const [chartsVisible, setChartsVisible] = useState(true);

  if (!insights) {
    return loading ? (
      <section className="insights-section" id="insights" aria-live="polite">
        <div className="message">
          <span className="loading-leaf">📊</span>
          <p>Sniffing out the patterns...</p>
        </div>
      </section>
    ) : null;
  }

  const { familyCount, standaloneCount, withSubs, subBreedCount, topThree, topThreeShare, averageSubs, biggerThanAverage } =
    insights;
  const mostlyStandalone = standaloneCount >= withSubs.length;
  const presets = buildPresets(insights);

  return (
    <section className="insights-section" id="insights">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE STORY IN THE DATA</span>
          <h2>How doggy families are organized</h2>
          <p>
            Every breed belongs to a family, and some families split into sub-breeds. These charts show how
            uneven that is. Use the toggles to look at the same data a different way.
          </p>
        </div>

        <button
          type="button"
          className="ghost-button charts-toggle"
          aria-expanded={chartsVisible}
          aria-controls="chart-grid"
          onClick={() => setChartsVisible((visible) => !visible)}
        >
          {chartsVisible ? "Hide charts" : "Show charts"}
        </button>
      </div>

      {chartsVisible && (
        <div className="chart-grid" id="chart-grid">
          <FamilyChart insights={insights} onPickFamily={onPickFamily} />
          <MakeupChart insights={insights} />
        </div>
      )}

      <div className="insight-grid">
        <article className="insight-card">
          <span className="insight-icon" aria-hidden="true">🐕</span>
          <h3>{mostlyStandalone ? "Most families stand alone" : "Most families have sub-breeds"}</h3>
          <p>
            {standaloneCount} of {familyCount} families ({percent(standaloneCount, familyCount)}%) have no
            sub-breeds, while {withSubs.length} {pluralize(withSubs.length, "family has", "families have")} at
            least one.
          </p>
        </article>

        {withSubs.length > 0 && (
          <article className="insight-card">
            <span className="insight-icon" aria-hidden="true">🏆</span>
            <h3>Where the sub-breeds are concentrated</h3>
            <p>
              {joinList(topThree.map((f) => f.label))} account for {topThreeShare}% of all {subBreedCount}{" "}
              sub-breeds.
            </p>
          </article>
        )}

        {withSubs.length > 0 && (
          <article className="insight-card">
            <span className="insight-icon" aria-hidden="true">📏</span>
            <h3>What counts as a big family?</h3>
            <p>
              A family with sub-breeds has {averageSubs.toFixed(1)} of them on average, and{" "}
              {biggerThanAverage} {pluralize(biggerThanAverage, "family is", "families are")} above that.
            </p>
          </article>
        )}
      </div>

      <div className="try-filters">
        <h3>Try these filters in the gallery</h3>
        <div className="try-filter-list">
          {presets.map((preset) => (
            <button key={preset.id} type="button" onClick={() => onApplyPreset(preset.filters)}>
              <strong>{preset.label}</strong>
              <span>{preset.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}