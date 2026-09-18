import { Routes, Route, Outlet } from "react-router-dom";
import { RequireAdmin } from "./RequireAdmin";
import AdminLayout from "@/pages/admin/layout";
import TheocentricLayout from "@/pages/admin/theocentric/layout";
import DoxologyLayout from "@/pages/admin/doxology/layout";
import AdminOverview from "@/pages/admin/page";
import AdminProfile from "@/pages/admin/profile/page";
import AdminAnalytics from "@/pages/admin/analytics/page";
import AdminApiManagement from "@/pages/admin/api-management/page";
import AdminAuditLogs from "@/pages/admin/audit-logs/page";
import AdminBackups from "@/pages/admin/backups/page";
import AdminBadgesStreaks from "@/pages/admin/badges-streaks/page";
import AdminBooks from "@/pages/admin/books/page";
import AdminCategories from "@/pages/admin/categories/page";
import AdminFeedOrdering from "@/pages/admin/feed-ordering/page";
import AdminInfographics from "@/pages/admin/infographics/page";
import AdminLearningAnalytics from "@/pages/admin/learning-analytics/page";
import AdminMediaLibrary from "@/pages/admin/media-library/page";
import AdminMemberships from "@/pages/admin/memberships/page";
import AdminNotifications from "@/pages/admin/notifications/page";
import AdminPayments from "@/pages/admin/payments/page";
import AdminPodcasts from "@/pages/admin/podcasts/page";
import AdminRecommendations from "@/pages/admin/recommendations/page";
import AdminRegions from "@/pages/admin/regions/page";
import AdminResearchReports from "@/pages/admin/research-reports/page";
import AdminRoles from "@/pages/admin/roles/page";
import AdminRssManager from "@/pages/admin/rss-manager/page";
import AdminSearch from "@/pages/admin/search/page";
import AdminSecurity from "@/pages/admin/security/page";
import AdminSeoAeo from "@/pages/admin/seo-aeo/page";
import AdminServices from "@/pages/admin/services/page";
import AdminSettings from "@/pages/admin/settings/page";
import AdminSocialLinks from "@/pages/admin/social-links/page";
import AdminTags from "@/pages/admin/tags/page";
import AdminTopics from "@/pages/admin/topics/page";
import AdminUsers from "@/pages/admin/users/page";
import AdminPlatformsDetail from "@/pages/admin/platforms/detail/page";
import AdminTheocentricIndex from "@/pages/admin/theocentric/page";
import AdminTheocentric40Rabbana from "@/pages/admin/theocentric/40-rabbana/page";
import AdminTheocentricAdhkars from "@/pages/admin/theocentric/adhkars/page";
import AdminTheocentricAfterSalah from "@/pages/admin/theocentric/after-salah/page";
import AdminTheocentricArchived from "@/pages/admin/theocentric/archived/page";
import AdminTheocentricBeforeSleep from "@/pages/admin/theocentric/before-sleep/page";
import AdminTheocentricCategories from "@/pages/admin/theocentric/categories/page";
import AdminTheocentricCollections from "@/pages/admin/theocentric/collections/page";
import AdminTheocentricContentAudit from "@/pages/admin/theocentric/content-audit/page";
import AdminTheocentricDailyJourney from "@/pages/admin/theocentric/daily-journey/page";
import AdminTheocentricDrafts from "@/pages/admin/theocentric/drafts/page";
import AdminTheocentricDuas from "@/pages/admin/theocentric/duas/page";
import AdminTheocentricEveningAdhkars from "@/pages/admin/theocentric/evening-adhkars/page";
import AdminTheocentricExport from "@/pages/admin/theocentric/export/page";
import AdminTheocentricFeatured from "@/pages/admin/theocentric/featured/page";
import AdminTheocentricImport from "@/pages/admin/theocentric/import/page";
import AdminTheocentricMorningAdhkars from "@/pages/admin/theocentric/morning-adhkars/page";
import AdminTheocentricPublished from "@/pages/admin/theocentric/published/page";
import AdminTheocentricQuranicSupplications from "@/pages/admin/theocentric/quranic-supplications/page";
import AdminTheocentricReferences from "@/pages/admin/theocentric/references/page";
import AdminTheocentricRuqiyah from "@/pages/admin/theocentric/ruqiyah/page";
import AdminTheocentricSettings from "@/pages/admin/theocentric/settings/page";
import AdminTheocentricSubcategories from "@/pages/admin/theocentric/subcategories/page";
import AdminTheocentricTags from "@/pages/admin/theocentric/tags/page";
import AdminTheocentricVerification from "@/pages/admin/theocentric/verification/page";
import AdminDoxologyIndex from "@/pages/admin/doxology/page";
import AdminDoxologyAudio from "@/pages/admin/doxology/audio/page";
import AdminDoxologySettings from "@/pages/admin/doxology/settings/page";
import AdminDoxologyUsers from "@/pages/admin/doxology/users/page";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAdmin>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </RequireAdmin>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="api-management" element={<AdminApiManagement />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="backups" element={<AdminBackups />} />
        <Route path="badges-streaks" element={<AdminBadgesStreaks />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="feed-ordering" element={<AdminFeedOrdering />} />
        <Route path="infographics" element={<AdminInfographics />} />
        <Route path="learning-analytics" element={<AdminLearningAnalytics />} />
        <Route path="media-library" element={<AdminMediaLibrary />} />
        <Route path="memberships" element={<AdminMemberships />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="podcasts" element={<AdminPodcasts />} />
        <Route path="recommendations" element={<AdminRecommendations />} />
        <Route path="regions" element={<AdminRegions />} />
        <Route path="research-reports" element={<AdminResearchReports />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="rss-manager" element={<AdminRssManager />} />
        <Route path="search" element={<AdminSearch />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="seo-aeo" element={<AdminSeoAeo />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="social-links" element={<AdminSocialLinks />} />
        <Route path="tags" element={<AdminTags />} />
        <Route path="topics" element={<AdminTopics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="platforms/:id" element={<AdminPlatformsDetail />} />
        <Route
          path="theocentric"
          element={
            <TheocentricLayout>
              <Outlet />
            </TheocentricLayout>
          }
        >
          <Route index element={<AdminTheocentricIndex />} />
          <Route path="40-rabbana" element={<AdminTheocentric40Rabbana />} />
          <Route path="adhkars" element={<AdminTheocentricAdhkars />} />
          <Route path="after-salah" element={<AdminTheocentricAfterSalah />} />
          <Route path="archived" element={<AdminTheocentricArchived />} />
          <Route path="before-sleep" element={<AdminTheocentricBeforeSleep />} />
          <Route path="categories" element={<AdminTheocentricCategories />} />
          <Route path="collections" element={<AdminTheocentricCollections />} />
          <Route path="content-audit" element={<AdminTheocentricContentAudit />} />
          <Route path="daily-journey" element={<AdminTheocentricDailyJourney />} />
          <Route path="drafts" element={<AdminTheocentricDrafts />} />
          <Route path="duas" element={<AdminTheocentricDuas />} />
          <Route path="evening-adhkars" element={<AdminTheocentricEveningAdhkars />} />
          <Route path="export" element={<AdminTheocentricExport />} />
          <Route path="featured" element={<AdminTheocentricFeatured />} />
          <Route path="import" element={<AdminTheocentricImport />} />
          <Route path="morning-adhkars" element={<AdminTheocentricMorningAdhkars />} />
          <Route path="published" element={<AdminTheocentricPublished />} />
          <Route path="quranic-supplications" element={<AdminTheocentricQuranicSupplications />} />
          <Route path="references" element={<AdminTheocentricReferences />} />
          <Route path="ruqiyah" element={<AdminTheocentricRuqiyah />} />
          <Route path="settings" element={<AdminTheocentricSettings />} />
          <Route path="subcategories" element={<AdminTheocentricSubcategories />} />
          <Route path="tags" element={<AdminTheocentricTags />} />
          <Route path="verification" element={<AdminTheocentricVerification />} />
        </Route>
        <Route
          path="doxology"
          element={
            <DoxologyLayout>
              <Outlet />
            </DoxologyLayout>
          }
        >
          <Route index element={<AdminDoxologyIndex />} />
          <Route path="audio" element={<AdminDoxologyAudio />} />
          <Route path="settings" element={<AdminDoxologySettings />} />
          <Route path="users" element={<AdminDoxologyUsers />} />
        </Route>
      </Route>
    </Routes>
  );
}
