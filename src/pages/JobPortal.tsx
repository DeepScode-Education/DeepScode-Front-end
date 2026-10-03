import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Briefcase, MapPin, Clock, Lock, Loader2, CheckCircle2,
  DollarSign, AlertTriangle, Paperclip, Search, SlidersHorizontal,
  Building2, GraduationCap, Users, ArrowUpDown, X,
  Plus, Link as LinkIcon,  
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  publicOpportunitiesApi,
  opportunityApplicationApi,
  getToken,
  Opportunity,
    ApplicationLink,               
  APPLICATION_LINK_TYPES,       
} from "@/integrations/client";

const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

type SortOption = "newest" | "salary_desc" | "salary_asc" | "urgent_first";

const uniqueStrings = (arr: (string | undefined | null)[]): string[] =>
  Array.from(new Set(arr.filter((v): v is string => !!v && v.trim() !== ""))).sort((a, b) =>
    a.localeCompare(b)
  );

const formatSalary = (opp: Opportunity): string | null => {
  if (opp.payMin == null && opp.payMax == null) return null;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  const period = opp.payPeriod ? `/${opp.payPeriod}` : "";
  const currency = opp.currency ? `${opp.currency} ` : "";
  if (opp.payMin != null && opp.payMax != null) {
    return `${currency}${fmt(opp.payMin)} - ${fmt(opp.payMax)}${period}`;
  }
  const value = (opp.payMin ?? opp.payMax) as number;
  return `${currency}${fmt(value)}${period}`;
};

const timeAgo = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Posted ${months} month${months > 1 ? "s" : ""} ago`;
};

const toggleInList = (
  setter: (fn: (prev: string[]) => string[]) => void,
  value: string
) => {
  setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
};

interface FilterGroupProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

const FilterGroup = ({ title, options, selected, onToggle }: FilterGroupProps) => {
  if (options.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={selected.includes(opt)} onCheckedChange={() => onToggle(opt)} />
            <span className="truncate text-foreground/80">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const JobPortal = () => {
  const { toast } = useToast();
  const isLoggedIn = !!getToken();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const [applyTarget, setApplyTarget] = useState<Opportunity | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", coverLetter: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [links, setLinks] = useState<ApplicationLink[]>([]);       
const [linkErrors, setLinkErrors] = useState<string[]>([]); 
  const [submitting, setSubmitting] = useState(false);

  // ── Search / sort ──
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // ── Sidebar filters ──
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 0]);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = unwrap(await publicOpportunitiesApi.getAll());
      if (!res?.success) throw new Error(res?.message || "Failed to load opportunities");
      setOpportunities(res.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyApplications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = unwrap(await opportunityApplicationApi.getMine());
      if (res?.success) {
        const ids = new Set<string>(
          (res.data || []).map((a: any) =>
            typeof a.opportunity === "string" ? a.opportunity : a.opportunity?._id
          )
        );
        setAppliedIds(ids);
      }
    } catch {
      // non-critical — silently ignore
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchOpportunities();
    fetchMyApplications();
  }, [fetchOpportunities, fetchMyApplications]);

  // ── Dynamic filter option lists — derived entirely from API data ──
  const jobTypes = useMemo(() => uniqueStrings(opportunities.map((o) => o.employmentType)), [opportunities]);
  const workModes = useMemo(() => uniqueStrings(opportunities.map((o) => o.workMode)), [opportunities]);
  const locations = useMemo(() => uniqueStrings(opportunities.map((o) => o.primaryLocation)), [opportunities]);
  const experiences = useMemo(
    () => uniqueStrings(opportunities.map((o) => o.eligibility?.experienceLevel)),
    [opportunities]
  );
  const companies = useMemo(() => uniqueStrings(opportunities.map((o) => o.companyEntity)), [opportunities]);

  const salaryValues = useMemo(() => {
    const vals: number[] = [];
    opportunities.forEach((o) => {
      if (o.payMin != null) vals.push(o.payMin);
      if (o.payMax != null) vals.push(o.payMax);
    });
    return vals;
  }, [opportunities]);

  const hasSalaryData = salaryValues.length > 0;
  const dataMinSalary = hasSalaryData ? Math.min(...salaryValues) : 0;
  const dataMaxSalary = hasSalaryData ? Math.max(...salaryValues) : 0;

  useEffect(() => {
    if (hasSalaryData) setSalaryRange([dataMinSalary, dataMaxSalary]);
  }, [hasSalaryData, dataMinSalary, dataMaxSalary]);

  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSelectedJobTypes([]);
    setSelectedWorkModes([]);
    setSelectedLocations([]);
    setSelectedExperience([]);
    setSelectedCompanies([]);
    setUrgentOnly(false);
    if (hasSalaryData) setSalaryRange([dataMinSalary, dataMaxSalary]);
  };

  const activeFilterCount = useMemo(() => {
    let count =
      selectedJobTypes.length +
      selectedWorkModes.length +
      selectedLocations.length +
      selectedExperience.length +
      selectedCompanies.length;
    if (urgentOnly) count += 1;
    if (hasSalaryData && (salaryRange[0] !== dataMinSalary || salaryRange[1] !== dataMaxSalary)) count += 1;
    return count;
  }, [
    selectedJobTypes, selectedWorkModes, selectedLocations, selectedExperience,
    selectedCompanies, urgentOnly, salaryRange, hasSalaryData, dataMinSalary, dataMaxSalary,
  ]);

  const filteredOpportunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();

    return opportunities.filter((opp) => {
      if (q) {
        const haystack = [opp.jobTitle, opp.companyEntity, ...(opp.requiredSkills || [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (loc && !(opp.primaryLocation || "").toLowerCase().includes(loc)) return false;
      if (selectedJobTypes.length && !selectedJobTypes.includes(opp.employmentType)) return false;
      if (selectedWorkModes.length && !selectedWorkModes.includes(opp.workMode)) return false;
      if (selectedLocations.length && !selectedLocations.includes(opp.primaryLocation)) return false;
      if (
        selectedExperience.length &&
        !selectedExperience.includes(opp.eligibility?.experienceLevel || "")
      )
        return false;
      if (selectedCompanies.length && !selectedCompanies.includes(opp.companyEntity)) return false;
      if (urgentOnly && !opp.urgentRequirement) return false;

      if (hasSalaryData && (opp.payMin != null || opp.payMax != null)) {
        const jobMin = opp.payMin ?? opp.payMax ?? 0;
        const jobMax = opp.payMax ?? opp.payMin ?? 0;
        if (jobMax < salaryRange[0] || jobMin > salaryRange[1]) return false;
      }
      return true;
    });
  }, [
    opportunities, searchQuery, locationQuery, selectedJobTypes, selectedWorkModes,
    selectedLocations, selectedExperience, selectedCompanies, urgentOnly, salaryRange, hasSalaryData,
  ]);

  const sortedOpportunities = useMemo(() => {
    const arr = [...filteredOpportunities];
    switch (sortBy) {
      case "salary_desc":
        arr.sort((a, b) => (b.payMax ?? b.payMin ?? 0) - (a.payMax ?? a.payMin ?? 0));
        break;
      case "salary_asc":
        arr.sort((a, b) => (a.payMin ?? a.payMax ?? 0) - (b.payMin ?? b.payMax ?? 0));
        break;
      case "urgent_first":
        arr.sort((a, b) => Number(b.urgentRequirement) - Number(a.urgentRequirement));
        break;
      default:
        arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return arr;
  }, [filteredOpportunities, sortBy]);

  const openApply = (opp: Opportunity) => {
    setForm({ fullName: "", email: "", phone: "", coverLetter: "" });
    setResumeFile(null);
      setLinks([]);           
  setLinkErrors([]);      
    setApplyTarget(opp);
  };


  // ── Links editor helpers ──
const addLink = () => {
  setLinks((prev) => [...prev, { type: "LinkedIn", label: "", url: "" }]);
};

const updateLink = (index: number, patch: Partial<ApplicationLink>) => {
  setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
};

const removeLink = (index: number) => {
  setLinks((prev) => prev.filter((_, i) => i !== index));
};

const validateLinksLocal = (): string[] => {
  const errors: string[] = [];
  links.forEach((l, i) => {
    const pos = `Link ${i + 1}`;
    if (!l.type) { errors.push(`${pos}: type is required`); return; }
    if (l.type === "Other" && !l.label?.trim()) {
      errors.push(`${pos}: custom label is required for "Other"`);
    }
    if (!l.url.trim()) {
      errors.push(`${pos}: URL is required`);
    } else {
      try {
        const u = new URL(l.url.trim());
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
      } catch {
        errors.push(`${pos}: "${l.url}" is not a valid URL`);
      }
    }
  });
  return errors;
};

  // const handleSubmitApplication = async () => {
  //   if (!applyTarget) return;
  //   if (!form.fullName.trim() || !form.email.trim()) {
  //     toast({ title: "Missing details", description: "Name and email are required.", variant: "destructive" });
  //     return;
  //   }
  //   setSubmitting(true);
  //   try {
  //     const res = unwrap(
  //       await opportunityApplicationApi.apply(applyTarget._id, {
  //         ...form,
  //         resume: resumeFile || undefined,
  //       })
  //     );
  //     if (!res?.success) throw new Error(res?.message || "Failed to submit application");

  //     toast({ title: "Application submitted", description: `You've applied for ${applyTarget.jobTitle}.` });
  //     setAppliedIds((prev) => new Set(prev).add(applyTarget._id));
  //     setApplyTarget(null);
  //   } catch (err: any) {
  //     toast({ title: "Could not submit", description: err?.message || "Please try again.", variant: "destructive" });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

const handleSubmitApplication = async () => {
  if (!applyTarget) return;
  if (!form.fullName.trim() || !form.email.trim()) {
    toast({ title: "Missing details", description: "Name and email are required.", variant: "destructive" });
    return;
  }

  // NEW: validate links before submitting
  const errs = validateLinksLocal();
  setLinkErrors(errs);
  if (errs.length > 0) {
    toast({ title: "Fix your links", description: "Some links are incomplete or invalid.", variant: "destructive" });
    return;
  }

  setSubmitting(true);
  try {
    const res = unwrap(
      await opportunityApplicationApi.apply(applyTarget._id, {
        ...form,
        resume: resumeFile || undefined,
        links: links.filter((l) => l.url.trim()), // NEW — drop any empty rows
      })
    );
    if (!res?.success) throw new Error(res?.message || "Failed to submit application");

    toast({ title: "Application submitted", description: `You've applied for ${applyTarget.jobTitle}.` });
    setAppliedIds((prev) => new Set(prev).add(applyTarget._id));
    setApplyTarget(null);
  } catch (err: any) {
    toast({ title: "Could not submit", description: err?.message || "Please try again.", variant: "destructive" });
  } finally {
    setSubmitting(false);
  }
};

  const renderFilterPanel = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-medium text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterGroup
        title="Job Type"
        options={jobTypes}
        selected={selectedJobTypes}
        onToggle={(v) => toggleInList(setSelectedJobTypes, v)}
      />
      <FilterGroup
        title="Work Mode"
        options={workModes}
        selected={selectedWorkModes}
        onToggle={(v) => toggleInList(setSelectedWorkModes, v)}
      />
      {/* <FilterGroup
        title="Location"
        options={locations}
        selected={selectedLocations}
        onToggle={(v) => toggleInList(setSelectedLocations, v)}
      /> */}
      <FilterGroup
        title="Experience"
        options={experiences}
        selected={selectedExperience}
        onToggle={(v) => toggleInList(setSelectedExperience, v)}
      />
      {/* <FilterGroup
        title="Company"
        options={companies}
        selected={selectedCompanies}
        onToggle={(v) => toggleInList(setSelectedCompanies, v)}
      /> */}

      {hasSalaryData && (
        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Salary Range
          </h4>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="h-8 text-xs"
              value={salaryRange[0]}
              min={dataMinSalary}
              max={salaryRange[1]}
              onChange={(e) => setSalaryRange([Number(e.target.value), salaryRange[1]])}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              className="h-8 text-xs"
              value={salaryRange[1]}
              min={salaryRange[0]}
              max={dataMaxSalary}
              onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value)])}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <Checkbox id="urgent-only" checked={urgentOnly} onCheckedChange={(v) => setUrgentOnly(!!v)} />
        <Label htmlFor="urgent-only" className="cursor-pointer text-sm font-normal">
          Urgent Jobs Only
        </Label>
      </div>

      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={clearFilters}>
        <X size={13} /> Clear Filters
      </Button>
    </div>
  );

  const renderJobRow = (opp: Opportunity) => {
    const hasApplied = appliedIds.has(opp._id);
    const salary = formatSalary(opp);
    const posted = timeAgo(opp.createdAt);

    return (
      <div
        key={opp._id}
        className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/20"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold leading-snug text-foreground">{opp.jobTitle}</h3>
              {opp.urgentRequirement && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                  <AlertTriangle size={11} /> Urgent Hiring
                </span>
              )}
            </div>

            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Building2 size={13} /> {opp.companyEntity || "Confidential"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={13} /> {opp.primaryLocation || "—"}</span>
              <span className="flex items-center gap-1"><Briefcase size={13} /> {opp.employmentType || "—"}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {opp.workMode}</span>
              {opp.eligibility?.experienceLevel && (
                <span className="flex items-center gap-1"><GraduationCap size={13} /> {opp.eligibility.experienceLevel}</span>
              )}
              {typeof opp.openings === "number" && (
                <span className="flex items-center gap-1">
                  <Users size={13} /> {opp.openings} opening{opp.openings === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {opp.description && (
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{opp.description}</p>
            )}

            {!!opp.requiredSkills?.length && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {opp.requiredSkills.slice(0, 6).map((skill) => (
                  <span key={skill} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                    {skill}
                  </span>
                ))}
                {opp.requiredSkills.length > 6 && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    +{opp.requiredSkills.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2.5 sm:items-end">
            {salary && (
              <div className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <DollarSign size={13} /> {salary}
              </div>
            )}
            <Button
              size="sm"
              className="gap-1.5 text-white"
              disabled={hasApplied}
              variant={hasApplied ? "outline" : "default"}
              onClick={() => openApply(opp)}
            >
              {hasApplied ? (
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Applied</span>
              ) : (
                "Apply Now"
              )}
            </Button>
            {posted && <span className="text-[11px] text-muted-foreground">{posted}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black">Careers at Slate</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover roles from our hiring partners and take the next step in your career.
          </p>
        </div>

        {/* ── Search / sort header ── */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                className="pl-9"
                placeholder="Search jobs, skills or companies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative md:w-56">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                className="pl-9"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <Button className="gap-1.5 text-white md:w-auto">
              <Search size={15} /> Search
            </Button>

            <div className="flex items-center gap-2 md:ml-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-1.5 md:hidden">
                    <SlidersHorizontal size={14} /> Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[340px]">
                  <SheetHeader>
                    <SheetTitle>Filter Jobs</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{renderFilterPanel()}</div>
                  <div className="mt-6 border-t border-border pt-4">
                    <SheetClose asChild>
                      <Button className="w-full text-white">Show {sortedOpportunities.length} Jobs</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[170px]">
                  <ArrowUpDown size={13} className="mr-1.5 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="salary_desc">Salary: High to Low</SelectItem>
                  <SelectItem value="salary_asc">Salary: Low to High</SelectItem>
                  <SelectItem value="urgent_first">Urgent First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* ── Desktop sidebar ── */}
          <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-64 shrink-0 self-start overflow-y-auto rounded-2xl border border-border bg-card p-4 md:block">
            {renderFilterPanel()}
          </aside>

          {/* ── Job listings ── */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${sortedOpportunities.length} job${sortedOpportunities.length === 1 ? "" : "s"} found`}
              </p>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading opportunities...
              </div>
            ) : error ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button size="sm" variant="outline" onClick={fetchOpportunities}>Retry</Button>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-center text-muted-foreground">
                <Briefcase size={24} />
                <p className="text-sm">No open opportunities right now. Check back soon!</p>
              </div>
            ) : sortedOpportunities.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center text-muted-foreground">
                <Search size={22} />
                <p className="text-sm">No jobs match your filters.</p>
                <Button size="sm" variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="relative">
                <div className={`flex flex-col gap-3 ${!isLoggedIn ? "pointer-events-none select-none blur-sm" : ""}`}>
                  {sortedOpportunities.map(renderJobRow)}
                </div>

                {!isLoggedIn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-8 py-8 text-center shadow-lg backdrop-blur">
                      <Lock size={28} className="text-primary" />
                      <div>
                        <p className="text-base font-semibold">Login to view opportunities</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Sign in to see full job details and apply directly.
                        </p>
                      </div>
                      <Button className="text-white" onClick={() => window.location.assign("/login")}>
                        Login to Continue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Apply Modal (unchanged functionality) ── */}
      <Dialog open={!!applyTarget} onOpenChange={(open) => !open && setApplyTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {applyTarget?.jobTitle}</DialogTitle>
            <DialogDescription>{applyTarget?.companyEntity}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                className="mt-1.5"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                className="mt-1.5"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1.5"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Cover Letter</Label>
              <Textarea
                className="mt-1.5 h-24"
                placeholder="Why are you a good fit for this role?"
                value={form.coverLetter}
                onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
              />
            </div>
            <div>
              <Label>Resume (PDF/DOC, optional)</Label>
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                <Paperclip size={14} />
                {resumeFile ? resumeFile.name : "Choose file"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {/* ── Apply Modal (unchanged functionality) ── */}
<Dialog open={!!applyTarget} onOpenChange={(open) => !open && setApplyTarget(null)}>
  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Apply for {applyTarget?.jobTitle}</DialogTitle>
      <DialogDescription>{applyTarget?.companyEntity}</DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-2">
      <div>
        <Label>Full Name <span className="text-destructive">*</span></Label>
        <Input
          className="mt-1.5"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
      </div>
      <div>
        <Label>Email <span className="text-destructive">*</span></Label>
        <Input
          type="email"
          className="mt-1.5"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          className="mt-1.5"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div>
        <Label>Cover Letter</Label>
        <Textarea
          className="mt-1.5 h-24"
          placeholder="Why are you a good fit for this role?"
          value={form.coverLetter}
          onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
        />
      </div>
      <div>
        <Label>Resume (PDF/DOC, optional)</Label>
        <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
          <Paperclip size={14} />
          {resumeFile ? resumeFile.name : "Choose file"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {/* ── NEW: Generic Links section ── */}
      <div>
        <div className="flex items-center justify-between">
          <Label>Links (Portfolio, LinkedIn, GitHub, etc.)</Label>
          <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addLink}>
            <Plus size={13} /> Add Link
          </Button>
        </div>

        {links.length === 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Optional — add your LinkedIn, GitHub, portfolio, or any relevant link.
          </p>
        )}

        <div className="mt-2 space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-2.5 sm:flex-row sm:items-center">
              <Select
                value={link.type}
                onValueChange={(v) => updateLink(i, { type: v as ApplicationLink["type"] })}
              >
                <SelectTrigger className="h-9 sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_LINK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {link.type === "Other" && (
                <Input
                  placeholder="Custom label"
                  className="h-9 sm:w-32"
                  value={link.label ?? ""}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                />
              )}

              <div className="relative flex-1">
                <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                <Input
                  placeholder="https://..."
                  className="h-9 pl-7"
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                />
              </div>

              <Button type="button" size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => removeLink(i)}>
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>

        {linkErrors.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-xs text-destructive">
            {linkErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setApplyTarget(null)} disabled={submitting}>
        Cancel
      </Button>
      <Button className="text-white" onClick={handleSubmitApplication} disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Application
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyTarget(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button className="text-white" onClick={handleSubmitApplication} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPortal;