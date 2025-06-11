import { getLayoutByName } from '@/services/LayoutService';

export interface FooterProps {
  siteId: number;
}

export default async function Footer({ siteId }: FooterProps) {
  const footerLayout = await getLayoutByName(siteId, 'footer');
  return <>{footerLayout && <footer dangerouslySetInnerHTML={{ __html: footerLayout.html_content }} />}</>;
}
