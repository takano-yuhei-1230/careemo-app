import { getLayoutByName } from '@/services/LayoutService';

export interface HeaderProps {
  siteId: number;
}

export default async function Header({ siteId }: HeaderProps) {
  const headerLayout = await getLayoutByName(siteId, 'header');
  return <>{headerLayout && <header dangerouslySetInnerHTML={{ __html: headerLayout.html_content }} />}</>;
}
