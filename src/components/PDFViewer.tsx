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
    <Card className={className} data-id="2kykmupfz" data-path="src/components/PDFViewer.tsx">
      <CardContent className="p-4" data-id="d9ps7y7va" data-path="src/components/PDFViewer.tsx">
        {/* Controls */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2" data-id="8anxnr735" data-path="src/components/PDFViewer.tsx">
          <div className="flex items-center gap-2" data-id="fmtzpur8p" data-path="src/components/PDFViewer.tsx">
            <Button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              size="sm"
              variant="outline" data-id="0h4p3vro6" data-path="src/components/PDFViewer.tsx">

              <ChevronLeft className="h-4 w-4" data-id="5zzxdvymu" data-path="src/components/PDFViewer.tsx" />
              Previous
            </Button>
            <Badge variant="secondary" data-id="tc2o36hy9" data-path="src/components/PDFViewer.tsx">
              {currentPage} / {numPages}
            </Badge>
            <Button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              size="sm"
              variant="outline" data-id="1h2f5oaou" data-path="src/components/PDFViewer.tsx">

              Next
              <ChevronRight className="h-4 w-4" data-id="r47a5vcfk" data-path="src/components/PDFViewer.tsx" />
            </Button>
          </div>

          <div className="flex items-center gap-1" data-id="ifmvifzvg" data-path="src/components/PDFViewer.tsx">
            <Button onClick={zoomOut} size="sm" variant="outline" data-id="yxojxpakj" data-path="src/components/PDFViewer.tsx">
              <ZoomOut className="h-4 w-4" data-id="xcrx4i6jg" data-path="src/components/PDFViewer.tsx" />
            </Button>
            <Badge variant="outline" data-id="2rmd83997" data-path="src/components/PDFViewer.tsx">{Math.round(scale * 100)}%</Badge>
            <Button onClick={zoomIn} size="sm" variant="outline" data-id="5zn167hto" data-path="src/components/PDFViewer.tsx">
              <ZoomIn className="h-4 w-4" data-id="o7bpr9x34" data-path="src/components/PDFViewer.tsx" />
            </Button>
            <Button onClick={rotate} size="sm" variant="outline" data-id="gou2g1exe" data-path="src/components/PDFViewer.tsx">
              <RotateCw className="h-4 w-4" data-id="9olxw9fjc" data-path="src/components/PDFViewer.tsx" />
            </Button>
          </div>
        </div>

        {/* PDF Document Placeholder */}
        <div className="flex justify-center" data-id="8387wm8ks" data-path="src/components/PDFViewer.tsx">
          <div className="border border-border rounded-lg overflow-hidden bg-white" data-id="y1p1jnoit" data-path="src/components/PDFViewer.tsx">
            <div
              className="flex items-center justify-center bg-white shadow-lg"
              style={{
                width: `${400 * scale}px`,
                height: `${600 * scale}px`,
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }} data-id="nl16qn7nt" data-path="src/components/PDFViewer.tsx">

              <div className="text-center p-8" data-id="x2s156hsq" data-path="src/components/PDFViewer.tsx">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" data-id="melnliuj8" data-path="src/components/PDFViewer.tsx" />
                <h3 className="text-lg font-semibold mb-2" data-id="spv0roo88" data-path="src/components/PDFViewer.tsx">Slide {currentPage}</h3>
                <p className="text-muted-foreground" data-id="6lj7i9w8f" data-path="src/components/PDFViewer.tsx">
                  This is a placeholder for the PDF content.
                  <br data-id="jzd2sr4u0" data-path="src/components/PDFViewer.tsx" />
                  In a real implementation, the actual PDF would be rendered here.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg" data-id="ab87f0e5w" data-path="src/components/PDFViewer.tsx">
                  <p className="text-sm" data-id="yrcmderct" data-path="src/components/PDFViewer.tsx">
                    <strong data-id="yssk3mdal" data-path="src/components/PDFViewer.tsx">Sample Content:</strong>
                    <br data-id="gt4dtf95l" data-path="src/components/PDFViewer.tsx" />
                    • Business Overview
                    <br data-id="bhoc1mtxf" data-path="src/components/PDFViewer.tsx" />
                    • Market Analysis  
                    <br data-id="hmk380wqr" data-path="src/components/PDFViewer.tsx" />
                    • Strategic Recommendations
                    <br data-id="xv80y0jkp" data-path="src/components/PDFViewer.tsx" />
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