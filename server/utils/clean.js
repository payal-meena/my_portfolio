// Removes fields the client must never set
const META = ["_id", "__v", "createdAt", "updatedAt"];

function stripMeta(body) {
  const out = { ...(body || {}) };
  META.forEach((k) => delete out[k]);
  return out;
}

// { siteText: { nav: { about: "x" } } }  ->  { "siteText.nav.about": "x" }
// so a partial update never wipes the other nested fields
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

module.exports = { stripMeta, flatten };
