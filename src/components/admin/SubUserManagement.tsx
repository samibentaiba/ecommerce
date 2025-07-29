import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, UserPlus, Shield } from "lucide-react";
import { SubUser, Permission, CreateSubUserData, UpdateSubUserData } from "@/app/admin/(protected)/settings/hook";
import { ResourceType } from "@prisma/client";

interface SubUserManagementProps {
  subUsers: SubUser[];
  loading: boolean;
  saving: boolean;
  onCreateUser: (userData: CreateSubUserData) => Promise<SubUser | null>;
  onUpdateUser: (userData: UpdateSubUserData) => Promise<SubUser | null>;
  onDeleteUser: (userId: string) => Promise<boolean>;
}

const RESOURCE_LABELS: Record<ResourceType, string> = {
  ORDER: "Orders",
  PRODUCT: "Products",
  LANDING_PAGE: "Landing Pages",
  PRODUCT_PAGE: "Product Pages",
  CART: "Cart",
  WISHLIST: "Wishlist",
  SETTINGS: "Settings",
};

const DEFAULT_PERMISSIONS: Permission[] = Object.values(ResourceType).map(resource => ({
  id: "",
  userId: "",
  resource,
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
}));

export default function SubUserManagement({
  subUsers,
  loading,
  saving,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}: SubUserManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
    setPermissions(DEFAULT_PERMISSIONS);
  };

  const handleCreateUser = async () => {
    const userData: CreateSubUserData = {
      ...formData,
      permissions: permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete),
    };

    const result = await onCreateUser(userData);
    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    const userData: UpdateSubUserData = {
      id: editingUser.id,
      ...formData,
      permissions: permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete),
    };

    const result = await onUpdateUser(userData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetForm();
    }
  };

  const openEditDialog = (user: SubUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
    });

    // Set permissions based on user's existing permissions
    const userPermissions = user.permissions;
    const updatedPermissions = DEFAULT_PERMISSIONS.map(defaultPerm => {
      const existingPerm = userPermissions.find(p => p.resource === defaultPerm.resource);
      return existingPerm || defaultPerm;
    });
    setPermissions(updatedPermissions);

    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this sub-user?")) {
      await onDeleteUser(userId);
    }
  };

  const updatePermission = (resource: ResourceType, field: keyof Permission, value: boolean) => {
    setPermissions(prev =>
      prev.map(perm =>
        perm.resource === resource ? { ...perm, [field]: value } : perm
      )
    );
  };

  const getPermissionBadges = (userPermissions: Permission[]) => {
    const resourceCounts: Record<string, number> = {};
    
    userPermissions.forEach(perm => {
      const count = [perm.canView, perm.canCreate, perm.canEdit, perm.canDelete].filter(Boolean).length;
      if (count > 0) {
        resourceCounts[RESOURCE_LABELS[perm.resource]] = count;
      }
    });

    return Object.entries(resourceCounts).map(([resource, count]) => (
      <Badge key={resource} variant="secondary" className="text-xs">
        {resource}: {count}/4
      </Badge>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading sub-users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Sub-Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage sub-users and their permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Sub-User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sub-User</DialogTitle>
              <DialogDescription>
                Create a new sub-user and assign their permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <Label className="text-sm font-medium">Permissions</Label>
                </div>
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission.resource} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-medium">
                          {RESOURCE_LABELS[permission.resource]}
                        </Label>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={permission.canView}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.resource, "canView", checked)
                            }
                          />
                          <Label className="text-xs">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={permission.canCreate}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.resource, "canCreate", checked)
                            }
                          />
                          <Label className="text-xs">Create</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={permission.canEdit}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.resource, "canEdit", checked)
                            }
                          />
                          <Label className="text-xs">Edit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={permission.canDelete}
                            onCheckedChange={(checked) =>
                              updatePermission(permission.resource, "canDelete", checked)
                            }
                          />
                          <Label className="text-xs">Delete</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={saving || !formData.name || !formData.email || !formData.password}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sub-Users List</CardTitle>
          <CardDescription>
            {subUsers.length} sub-user{subUsers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No sub-users found. Create your first sub-user to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getPermissionBadges(user.permissions)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sub-User</DialogTitle>
            <DialogDescription>
              Update sub-user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <Label className="text-sm font-medium">Permissions</Label>
              </div>
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.resource} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">
                        {RESOURCE_LABELS[permission.resource]}
                      </Label>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={permission.canView}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.resource, "canView", checked)
                          }
                        />
                        <Label className="text-xs">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={permission.canCreate}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.resource, "canCreate", checked)
                          }
                        />
                        <Label className="text-xs">Create</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={permission.canEdit}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.resource, "canEdit", checked)
                          }
                        />
                        <Label className="text-xs">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={permission.canDelete}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.resource, "canDelete", checked)
                          }
                        />
                        <Label className="text-xs">Delete</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={saving || !formData.name || !formData.email}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Edit className="mr-2 h-4 w-4" />
                )}
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 