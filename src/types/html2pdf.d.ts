declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: 'jpeg' | 'png' | 'webp' | string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      letterRendering?: boolean;
      width?: number;
      height?: number;
      windowWidth?: number;
      windowHeight?: number;
    };
    jsPDF?: {
      unit?: string;
      format?: string | [number, number];
      orientation?: 'portrait' | 'landscape';
      hotfixes?: string[];
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    save(): Promise<void>;
    output(type: string): Promise<string | Blob>;
    toPdf(): Html2Pdf;
    get(type: string): Promise<unknown>;
  }

  function html2pdf(): Html2Pdf;

  export default html2pdf;
}
