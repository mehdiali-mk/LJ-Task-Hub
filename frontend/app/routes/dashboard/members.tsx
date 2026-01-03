import { Loader } from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { fetchData } from "@/lib/fetch-util";
import type { Workspace } from "@/types";
import { ArrowLeft, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";

export const clientLoader = async () => {
  try {
    const workspaces = await fetchData("/workspaces");
    return { workspaces };
  } catch (error) {
    console.log(error);
    return { workspaces: [] };
  }
};

const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderData = useLoaderData() as { workspaces: Workspace[] } | null;
  const workspaces = loaderData?.workspaces || [];

  const workspaceId = searchParams.get("workspaceId");
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.search = search;

    setSearchParams(params, { replace: true });
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  const handleSelectWorkspace = (wsId: string) => {
    setSearchParams({ workspaceId: wsId });
  };

  const handleBackToWorkspaces = () => {
    setSearchParams({});
    setSearch("");
  };

  // Show workspace cards if no workspace is selected
  if (!workspaceId) {
    return (
      <div className="space-y-6">
        <div className="flex items-start md:items-center justify-between">
          <h1 className="text-2xl font-bold">Select a Workspace</h1>
        </div>

        <p className="text-muted-foreground">
          Click on a workspace card to view its members.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces?.map((ws) => (
            <Card
              key={ws._id}
              className="cursor-pointer hover:bg-white/10 transition-colors border-white/10 bg-white/5"
              onClick={() => handleSelectWorkspace(ws._id)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <WorkspaceAvatar color={ws.color} name={ws.name} />
                <div className="flex-1">
                  <CardTitle className="text-lg">{ws.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {ws.description || "No description"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{ws.members?.length || 0} members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!workspaces || workspaces.length === 0) && (
          <div className="text-center text-muted-foreground py-12">
            No workspaces found. Create a workspace to get started.
          </div>
        )}
      </div>
    );
  }

  // Show loading state while fetching workspace details
  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!data) return <div>No workspace found</div>;

  const filteredMembers = data?.members?.filter(
    (member) =>
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToWorkspaces}
            className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{data.name} - Members</h1>
        </div>
      </div>

      <Input
        placeholder="Search members ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {filteredMembers?.length} members in this workspace
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="bg-gray-500">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback>
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-11 md:ml-0">
                      <Badge
                        variant={
                          data.manager && data.manager._id === member.user._id
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {data.manager && data.manager._id === member.user._id ? "Manager" : "User"}
                      </Badge>

                      <Badge variant={"outline"}>{data.name}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.user._id} className="">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="bg-gray-500 size-20 mb-4">
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback className="uppercase">
                      {member.user.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-lg font-medium mb-2">
                    {member.user.name}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    {member.user.email}
                  </p>

                  <Badge
                    variant={
                      data.manager && data.manager._id === member.user._id
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {data.manager && data.manager._id === member.user._id ? "Manager" : "User"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Members;
