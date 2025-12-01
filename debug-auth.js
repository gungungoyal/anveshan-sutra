// Simple script to debug authentication issues
console.log("=== Anveshan Sutra Authentication Debug ===");
console.log("Project URL: https://thsvuhwgauwvuecpejir.supabase.co");
console.log("");

console.log("Common issues and solutions:");
console.log("1. Email confirmations might be disabled in Supabase");
console.log("2. SMTP configuration might be missing");
console.log("3. Site URL might not be configured properly");
console.log("");

console.log("To fix email issues:");
console.log("1. Visit: https://supabase.com/dashboard/project/thsvuhwgauwvuecpejir/auth/settings");
console.log("2. Make sure 'Enable Email Signup' is checked");
console.log("3. Make sure 'Enable Email Confirmations' is checked");
console.log("4. Visit: https://supabase.com/dashboard/project/thsvuhwgauwvuecpejir/auth/url-configuration");
console.log("5. Make sure your site URL is set to: http://localhost:8080");
console.log("");

console.log("Alternative solutions:");
console.log("1. For development, you can temporarily disable email confirmations");
console.log("2. Check your spam/junk folder for confirmation emails");
console.log("3. Try using a different email provider if issues persist");