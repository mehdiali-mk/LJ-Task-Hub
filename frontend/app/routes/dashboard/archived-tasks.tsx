import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetArchivedTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, ChevronDown, ChevronRight, Clock, FilterIcon, Folder, LayoutGrid } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ArchivedTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";
  const initialFilter = searchParams.get("filter") || "all";

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);
  const [filter, setFilter] = useState<string>(initialFilter);
  
  // Track open/closed states for accordions. Key format: "workspaceId" or "workspaceId-projectId"
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Function to toggle accordion items
  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };
  
  useEffect(() => {
    const params: Record<string, string> = {};
    if (sortDirection !== "desc") params.sort = sortDirection;
    if (search) params.search = search;
    if (filter !== "all") params.filter = filter;
    setSearchParams(params, { replace: true });
  }, [sortDirection, search, filter]);

  const { data: archivedTasks = [], isLoading, isError, error } = useGetArchivedTasksQuery() as {
    data: Task[];
    isLoading: boolean;
    isError: boolean;
    error: any;
  };

  const groupedTasks = useMemo(() => {
    if (!archivedTasks || isError) return {};

    // 1. Filter
    let filtered = archivedTasks.filter((task) => {
       if (filter === "all") return true;
       if (filter === "todo") return task.status === "To Do";
       if (filter === "inprogress") return task.status === "In Progress";
       if (filter === "done") return task.status === "Done";
       if (filter === "high") return task.priority === "High";
       return true;
    });
    
    // 2. Search (Task Title, Task Desc, Project Title, Workspace Name)
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(lowerSearch) ||
        (task.description && task.description.toLowerCase().includes(lowerSearch)) ||
        (task.project && task.project.title && task.project.title.toLowerCase().includes(lowerSearch)) ||
        // @ts-ignore - workspace populate might differ in types
        (task.project && (task.project as any).workspace && (task.project as any).workspace.name && (task.project as any).workspace.name.toLowerCase().includes(lowerSearch))
      );
    }

    // 3. Sort
    filtered.sort((a, b) => {
        if (a.updatedAt && b.updatedAt) {
             return sortDirection === "asc"
             ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
             : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        return 0;
    });

    // 4. Group
    const groups: Record<string, { workspace: any, projects: Record<string, { project: any, tasks: Task[] }> }> = {};

    filtered.forEach(task => {
        if (!task.project || typeof task.project !== 'object') return;

        // Safe access in case deep populate failed or type mismatch
        const workspace = (task.project as any)?.workspace;
        
        // Ensure workspace is explicitly an object and has a name property (confirming population)
        if (!workspace || typeof workspace !== 'object' || !('name' in workspace)) return;
        
        const project = task.project;
        if (!project || !('title' in project)) return;
        
        if (!groups[workspace._id]) {
            groups[workspace._id] = { workspace, projects: {} };
        }
        
        if (!groups[workspace._id].projects[project._id]) {
            groups[workspace._id].projects[project._id] = { project, tasks: [] };
        }
        
        groups[workspace._id].projects[project._id].tasks.push(task);
    });

    return groups;
  }, [archivedTasks, filter, search, sortDirection, isError]);

  // Effect to auto-expand groups if they have results and search is active (optional, but good UX)
  useEffect(() => {
    if (search && Object.keys(groupedTasks).length > 0) {
        const allIds = new Set<string>();
        Object.values(groupedTasks).forEach(group => {
            allIds.add(group.workspace._id);
            Object.values(group.projects).forEach(projGroup => {
                allIds.add(`${group.workspace._id}-${projGroup.project._id}`);
            });
        });
        setOpenItems(allIds);
    }
  }, [groupedTasks, search]);


  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader /></div>;

  if (isError) {
     const backendError = error?.response?.data?.message || error?.message || "Unknown error";
     const debugError = error?.response?.data?.error;
     return (
        <div className="p-8 text-center text-red-500 bg-red-50/10 rounded-lg border border-red-200/20">
           <h3 className="text-lg font-semibold">Failed to load archived tasks</h3>
           <p className="mt-2">{backendError}</p>
           {debugError && <p className="text-xs text-muted-foreground mt-2 font-mono bg-black/20 p-2 rounded inline-block">{debugError}</p>}
           <p className="text-sm text-muted-foreground mt-4">Please check the console or server logs for more details.</p>
        </div>
     )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="text-muted-foreground w-6 h-6" /> 
            Archived Tasks
           </h1>
           <p className="text-muted-foreground text-sm">View and manage completely archived tasks across all workspaces.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
           <Input
            placeholder="Search by task, project, or workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[250px]"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Button
                variant={"outline"}
                size="icon"
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                title={sortDirection === "asc" ? "Sort Newest First" : "Sort Oldest First"}
              >
                {sortDirection === "asc" ? <ArrowUpRight className="rotate-180 w-4 h-4"/> : <ArrowUpRight className="w-4 h-4" />}
              </Button>
              
             <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} className="w-full sm:w-auto">
                <FilterIcon className="w-4 h-4 mr-2" /> 
                <span className="capitalize">{filter === "all" ? "Filter" : filter}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>All Tasks</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>To Do</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>Done</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>High Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-4 pb-10">
            {Object.keys(groupedTasks).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 py-24 text-center border-2 border-dashed border-muted rounded-lg bg-muted/10">
                    <div className="bg-muted p-4 rounded-full mb-4">
                         <Folder className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No archived tasks found</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm">
                        {search || filter !== "all" 
                            ? "Try adjusting your search or filters." 
                            : "Tasks that are archived will appear here, grouped by workspace and project."}
                    </p>
                    {(search || filter !== "all") && (
                        <Button variant="link" onClick={() => { setSearch(""); setFilter("all"); }} className="mt-2">
                            Clear filters
                        </Button>
                    )}
                </div>
            ) : (
                Object.values(groupedTasks).map((group) => (
                    <Card key={group.workspace._id} className="overflow-hidden border-none shadow-none bg-transparent">
                          {/* Workspace Header - Collapsible */}
                          <div 
                            className="flex items-center gap-2 p-3 px-4 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors mb-2"
                            onClick={() => toggleItem(group.workspace._id)}
                          >
                             {openItems.has(group.workspace._id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                             <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                                {group.workspace.name.substring(0, 2)}
                             </div>
                             <h2 className="font-semibold text-lg">{group.workspace.name}</h2>
                             <Badge variant="secondary" className="ml-auto">{Object.values(group.projects).reduce((acc, p) => acc + p.tasks.length, 0)}</Badge>
                          </div>

                          {/* Projects List */}
                           <Collapsible open={openItems.has(group.workspace._id)}>
                             <CollapsibleContent className="space-y-4 pl-4 md:pl-8 border-l-2 border-muted ml-4 my-2">
                                {Object.values(group.projects).map((projGroup) => (
                                    <div key={projGroup.project._id} className="space-y-2">
                                        <div 
                                            className="flex items-center gap-2 py-2 cursor-pointer group"
                                            onClick={() => toggleItem(`${group.workspace._id}-${projGroup.project._id}`)}
                                        >
                                            
                                            {openItems.has(`${group.workspace._id}-${projGroup.project._id}`) 
                                                ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> 
                                                : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                            }
                                            <LayoutGrid className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <h3 className="font-medium text-base hover:text-primary transition-colors">{projGroup.project.title}</h3>
                                            <span className="text-xs text-muted-foreground ml-1">({projGroup.tasks.length})</span>
                                        </div>

                                        <Collapsible open={openItems.has(`${group.workspace._id}-${projGroup.project._id}`)}>
                                            <CollapsibleContent className="grid grid-cols-1 gap-3 pl-2 md:pl-6 pb-4">
                                                {projGroup.tasks.map(task => (
                                                    <div key={task._id} className="group relative flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/50 transition-all">
                                                        <div className="flex gap-3">
                                                            <div className="mt-1">
                                                                {task.status === "Done" ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Link 
                                                                    to={`/workspaces/${group.workspace._id}/projects/${projGroup.project._id}/tasks/${task._id}`}
                                                                    className="font-medium hover:underline flex items-center gap-1.5"
                                                                >
                                                                    {task.title}
                                                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{task.description || "No description provided."}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 self-start mt-1">
                                                             <Badge variant={task.status === "Done" ? "default" : "outline"} className="text-xs py-0 h-5">
                                                                {task.status}
                                                             </Badge>
                                                             
                                                             {task.priority === "High" && (
                                                                <Badge variant="destructive" className="text-xs py-0 h-5">High</Badge>
                                                             )}
                                                             
                                                             {task.dueDate && (
                                                                 <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                                                                    {format(new Date(task.dueDate), "MMM d")}
                                                                 </span>
                                                             )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                ))}
                             </CollapsibleContent>
                           </Collapsible>
                    </Card>
                ))
            )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ArchivedTasks;
