import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PDFViewerProps {
  fileUrl: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

const PDFViewer = ({ fileUrl, currentPage = 1, onPageChange, className }: PDFViewerProps) => {
  const [numPages] = useState<number>(25); // Mock page count
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  const goToPrevPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    onPageChange?.(newPage);
  };

  const goToNextPage = () => {
    const newPage = Math.min(numPages, currentPage + 1);
    onPageChange?.(newPage);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Controls */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              size="sm"
              variant="outline">

              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Badge variant="secondary">
              {currentPage} / {numPages}
            </Badge>
            <Button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              size="sm"
              variant="outline">

              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button onClick={zoomOut} size="sm" variant="outline">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Badge variant="outline">{Math.round(scale * 100)}%</Badge>
            <Button onClick={zoomIn} size="sm" variant="outline">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button onClick={rotate} size="sm" variant="outline">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Document Placeholder */}
        <div className="flex justify-center">
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <div
              className="flex items-center justify-center bg-white shadow-lg"
              style={{
                width: `${400 * scale}px`,
                height: `${600 * scale}px`,
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}>

              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Slide {currentPage}</h3>
                <p className="text-muted-foreground">
                  This is a placeholder for the PDF content.
                  <br />
                  In a real implementation, the actual PDF would be rendered here.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Sample Content:</strong>
                    <br />
                    • Business Overview
                    <br />
                    • Market Analysis  
                    <br />
                    • Strategic Recommendations
                    <br />
                    • Implementation Timeline
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default PDFViewer;