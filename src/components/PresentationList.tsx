import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Download, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  User,
  Tag,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Presentation {
  ID: number;
  title: string;
  filename: string;
  file_id: number;
  total_pages: number;
  description: string;
  tags: string;
  is_active: boolean;
  CreateTime: string;
}

interface PresentationListProps {
  userId: number;
  onSelectPresentation: (presentation: Presentation) => void;
  refreshTrigger: number;
}

const PresentationList: React.FC<PresentationListProps> = ({ 
  userId, 
  onSelectPresentation, 
  refreshTrigger 
}) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchPresentations = async () => {
    try {
      console.log('Fetching presentations for user:', userId);
      const { data, error } = await window.ezsite.apis.tablePage('16721', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "ID",
        IsAsc: false,
        Filters: [
          { name: "user_id", op: "Equal", value: userId }
        ]
      });

      if (error) throw error;

      console.log('Presentations fetched:', data);
      setPresentations(data.List || []);
    } catch (error) {
      console.error('Error fetching presentations:', error);
      toast({
        title: "Error",
        description: "Failed to load presentations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, [userId, refreshTrigger]);

  const handleDelete = async (presentationId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete('16721', { ID: presentationId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Presentation deleted successfully."
      });

      setPresentations(prev => prev.filter(p => p.ID !== presentationId));
    } catch (error) {
      console.error('Error deleting presentation:', error);
      toast({
        title: "Error",
        description: "Failed to delete presentation.",
        variant: "destructive"
      });
    }
  };

  const handleSelect = (presentation: Presentation) => {
    setSelectedId(presentation.ID);
    console.log('Selected presentation:', presentation);
    onSelectPresentation(presentation);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTags = (tags: string) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (presentations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Presentations Yet
            </h3>
            <p className="text-gray-500">
              Upload your first PDF presentation to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Presentations</h3>
        <Badge variant="secondary">{presentations.length} presentations</Badge>
      </div>

      <div className="grid gap-4">
        {presentations.map((presentation) => (
          <Card 
            key={presentation.ID}
            className={`transition-all cursor-pointer hover:shadow-md ${
              selectedId === presentation.ID ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelect(presentation)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {presentation.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {presentation.filename}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(presentation.CreateTime)}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(presentation);
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(presentation.ID);
                    }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {presentation.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {presentation.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {formatTags(presentation.tags).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={presentation.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {presentation.is_active ? "Active" : "Inactive"}
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(presentation);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Present
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PresentationList;