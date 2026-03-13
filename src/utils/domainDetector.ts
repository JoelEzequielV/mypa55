//src/utils/domainDetector.ts
export const detectDomain = (site: string): string => {
    try {
  
      if (!site) return "";
  
      // si es URL completa
      if (site.includes("://")) {
        const url = new URL(site);
        return url.hostname.replace("www.", "");
      }
  
      // si ya parece dominio
      if (site.includes(".")) {
        return site.replace("www.", "").toLowerCase();
      }
  
      return site.toLowerCase();
  
    } catch {
      return site.toLowerCase();
    }
  };