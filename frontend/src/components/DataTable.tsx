import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { FloatObservation } from "../types";

interface DataTableProps {
  observations: FloatObservation[];
}

const PAGE_SIZE = 12;

export default function DataTable({ observations }: DataTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return observations;

    return observations.filter((row) =>
      [
        row.float_id,
        row.timestamp,
        row.latitude,
        row.longitude,
        row.depth_m,
        row.temperature_c,
        row.salinity_psu
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [observations, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <div className="table-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Search float, date, coordinates..."
          />
        </div>
        <span>
          {filtered.length.toLocaleString()} matching records
        </span>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Float ID</th>
              <th>Timestamp</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Depth (m)</th>
              <th>Temperature</th>
              <th>Salinity</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={`${row.float_id}-${row.timestamp}-${index}`}>
                <td>
                  <strong>{row.float_id}</strong>
                </td>
                <td>{formatTimestamp(row.timestamp)}</td>
                <td>{row.latitude.toFixed(3)}°</td>
                <td>{row.longitude.toFixed(3)}°</td>
                <td>{row.depth_m.toFixed(1)}</td>
                <td>{row.temperature_c.toFixed(2)} °C</td>
                <td>{row.salinity_psu.toFixed(3)} PSU</td>
              </tr>
            ))}

            {!visible.length && (
              <tr>
                <td colSpan={7} className="table-empty">
                  No observations match the current search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={safePage <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span>
          Page {safePage} of {pageCount}
        </span>
        <button
          disabled={safePage >= pageCount}
          onClick={() =>
            setPage((current) => Math.min(pageCount, current + 1))
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatTimestamp(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
}
