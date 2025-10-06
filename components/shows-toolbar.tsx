import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Check, Archive, Trash2, RotateCcw } from 'lucide-react';

interface ShowsToolbarProps {
  selectedShows: Set<string>;
  filteredShows: any[];
  page: number;
  totalPages: number;
  onGotoPrev: () => void;
  onGotoNext: () => void;
  onSelectAll: () => void;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
  onBulkUnarchive?: () => void;
  isBulkArchiving?: boolean;
  isBulkDeleting?: boolean;
  isBulkUnarchiving?: boolean;
  userRole?: string;
  isTopToolbar?: boolean;
  // Additional props for desktop functionality
  pageRangeStart?: number;
  pageRangeEnd?: number;
  gotoInput?: string;
  setGotoInput?: (value: string) => void;
  handleGoto?: () => void;
}

export const ShowsToolbar: React.FC<ShowsToolbarProps> = ({
  selectedShows,
  filteredShows,
  page,
  totalPages,
  onGotoPrev,
  onGotoNext,
  onSelectAll,
  onBulkArchive,
  onBulkDelete,
  onBulkUnarchive,
  isBulkArchiving = false,
  isBulkDeleting = false,
  isBulkUnarchiving = false,
  userRole,
  isTopToolbar = false,
  pageRangeStart = 0,
  pageRangeEnd = 0,
  gotoInput = "",
  setGotoInput = () => {},
  handleGoto = () => {}
}) => {
  const gotoPrev = () => onGotoPrev();
  const gotoNext = () => onGotoNext();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 rounded-lg mb-2">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        {/* Pagination - centered */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected count and Select All button - same line */}
        <div className="flex items-center justify-between gap-2">
          {/* Selected count on left */}
          <div className="px-2 flex flex-col items-center justify-center min-w-[60px] gap-0 h-9 border border-input bg-background rounded-md">
            <span className="text-sm font-bold leading-none">{selectedShows.size}</span>
            <span className="text-xs text-muted-foreground leading-none">Selected</span>
          </div>
          
          {/* Select All button on right */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border flex-1"
          >
            <Check className="h-4 w-4" />
            {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {/* Archive and delete buttons - separate lines */}
        {selectedShows.size > 0 && (
          <div className="space-y-2">
            {userRole === "admin" && onBulkArchive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkArchive}
                disabled={isBulkArchiving}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700 w-full"
              >
                <Archive className="h-4 w-4 mr-2" />
                {isBulkArchiving ? "Archiving..." : "Archive Selected"}
              </Button>
            )}
            {userRole === "admin" && onBulkUnarchive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkUnarchive}
                disabled={isBulkUnarchiving}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700 w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
              </Button>
            )}
            {userRole === "admin" && onBulkDelete && (
              <Button 
                size="sm" 
                onClick={onBulkDelete}
                disabled={isBulkDeleting}
                className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isBulkDeleting ? "Deleting..." : "Delete Selected"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Left side - Selection info */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
          >
            <Check className="h-4 w-4" />
            {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
          </Button>
          <Badge variant="outline" className="text-xs font-normal">
            {selectedShows.size} of {filteredShows.length} selected
          </Badge>
          {selectedShows.size > 0 && (
            <div className="flex items-center gap-2">
              {userRole === "admin" && onBulkArchive && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBulkArchive}
                  disabled={isBulkArchiving}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {isBulkArchiving ? "Archiving..." : "Archive Selected"}
                </Button>
              )}
              {userRole === "admin" && onBulkUnarchive && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBulkUnarchive}
                  disabled={isBulkUnarchiving}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
                </Button>
              )}
              {userRole === "admin" && onBulkDelete && (
                <Button 
                  size="sm" 
                  onClick={onBulkDelete}
                  disabled={isBulkDeleting}
                  className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right side - Pagination */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{pageRangeStart}</span>–<span className="font-medium">{pageRangeEnd}</span> of{" "}
            <span className="font-medium">{filteredShows.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <Label htmlFor="page-input" className="text-xs text-muted-foreground">Go to</Label>
              <Input
                id="page-input"
                type="number"
                min={1}
                max={totalPages}
                value={gotoInput || page}
                onChange={(e) => setGotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGoto()
                }}
                className="h-8 w-16"
              />
              <Button variant="outline" size="sm" onClick={handleGoto}>Go</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShowsBottomToolbar: React.FC<ShowsToolbarProps> = ({
  selectedShows,
  filteredShows,
  page,
  totalPages,
  onGotoPrev,
  onGotoNext,
  onSelectAll,
  onBulkArchive,
  onBulkDelete,
  onBulkUnarchive,
  isBulkArchiving = false,
  isBulkDeleting = false,
  isBulkUnarchiving = false,
  userRole,
  isTopToolbar = false,
  pageRangeStart = 0,
  pageRangeEnd = 0,
  gotoInput = "",
  setGotoInput = () => {},
  handleGoto = () => {}
}) => {
  const gotoPrev = () => onGotoPrev();
  const gotoNext = () => onGotoNext();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 rounded-lg mt-2">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        {/* Selected count and Select All button - same line */}
        <div className="flex items-center justify-between gap-2">
          {/* Selected count on left */}
          <div className="px-2 flex flex-col items-center justify-center min-w-[60px] gap-0 h-9 border border-input bg-background rounded-md">
            <span className="text-sm font-bold leading-none">{selectedShows.size}</span>
            <span className="text-xs text-muted-foreground leading-none">Selected</span>
          </div>
          
          {/* Select All button on right */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border flex-1"
          >
            <Check className="h-4 w-4" />
            {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {/* Archive and delete buttons - separate lines */}
        {selectedShows.size > 0 && (
          <div className="space-y-2">
            {userRole === "admin" && onBulkArchive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkArchive}
                disabled={isBulkArchiving}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700 w-full"
              >
                <Archive className="h-4 w-4 mr-2" />
                {isBulkArchiving ? "Archiving..." : "Archive Selected"}
              </Button>
            )}
            {userRole === "admin" && onBulkUnarchive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkUnarchive}
                disabled={isBulkUnarchiving}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700 w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
              </Button>
            )}
            {userRole === "admin" && onBulkDelete && (
              <Button 
                size="sm" 
                onClick={onBulkDelete}
                disabled={isBulkDeleting}
                className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isBulkDeleting ? "Deleting..." : "Delete Selected"}
              </Button>
            )}
          </div>
        )}

        {/* Pagination - centered at bottom */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Left side - Select all button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 border-border hover:border-border"
          >
            <Check className="h-4 w-4" />
            {selectedShows.size === filteredShows.length ? "Deselect All" : "Select All"}
          </Button>
          <Badge variant="outline" className="text-xs font-normal">
            {selectedShows.size} of {filteredShows.length} selected
          </Badge>
          {selectedShows.size > 0 && (
            <div className="flex items-center gap-2">
              {userRole === "admin" && onBulkArchive && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBulkArchive}
                  disabled={isBulkArchiving}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {isBulkArchiving ? "Archiving..." : "Archive Selected"}
                </Button>
              )}
              {userRole === "admin" && onBulkUnarchive && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBulkUnarchive}
                  disabled={isBulkUnarchiving}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isBulkUnarchiving ? "Unarchiving..." : "Unarchive Selected"}
                </Button>
              )}
              {userRole === "admin" && onBulkDelete && (
                <Button 
                  size="sm" 
                  onClick={onBulkDelete}
                  disabled={isBulkDeleting}
                  className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isBulkDeleting ? "Deleting..." : "Delete Selected"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right side - Pagination */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{pageRangeStart}</span>–<span className="font-medium">{pageRangeEnd}</span> of{" "}
            <span className="font-medium">{filteredShows.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={gotoPrev} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={gotoNext} disabled={page === totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <Label htmlFor="page-input" className="text-xs text-muted-foreground">Go to</Label>
              <Input
                id="page-input"
                type="number"
                min={1}
                max={totalPages}
                value={gotoInput || page}
                onChange={(e) => setGotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGoto()
                }}
                className="h-8 w-16"
              />
              <Button variant="outline" size="sm" onClick={handleGoto}>Go</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
