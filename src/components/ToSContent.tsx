import type { Language } from '@/i18n/translations';

interface ToSContentProps {
  lang: Language;
}

export function ToSContent({ lang }: ToSContentProps) {
  if (lang === 'fa') {
    return (
      <div className="space-y-5 text-sm leading-relaxed text-lavenderDim">
        <div className="text-center space-y-1 pb-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-lavender">شرایط و قوانین استفاده از خدمات (Fars VPN)</h2>
          <p className="text-xs text-lavenderDim">آخرین بروزرسانی: مرداد ۱۴۰۵ (آگوست ۲۰۲۶)</p>
        </div>

        <p>
          به اپلیکیشن Fars VPN خوش آمدید. با دانلود، نصب یا استفاده از این برنامه، شما موافقت کامل خود را با تمامی قوانین و شرایط زیر اعلام می‌دارید. در صورت عدم موافقت با هر بخش از این قوانین، مجاز به استفاده از این اپلیکیشن نمی‌باشید.
        </p>

        <Section number="۱" title="پذیرش شرایط">
          <p>
            با استفاده از Fars VPN، شما تأیید می‌نمایید که حداقل ۱۸ سال سن دارید (یا دارای رضایت سرپرست قانونی هستید) و از نظر قانونی توانایی پذیرش این تعهدنامه را دارا می‌باشید.
          </p>
        </Section>

        <Section number="۲" title="شرح خدمات و نحوه استفاده (Reverse VPN)">
          <p>
            اپلیکیشن Fars VPN یک سرویس شبکه خصوصی مجازی برای مسیریابی ترافیک اینترنت است که عمدتاً برای کاربران خارج از کشور جهت دریافت آی‌پِی (IP) ایران طراحی شده است.
          </p>
          <ul className="list-disc pr-5 space-y-1 mt-2">
            <li>خدمات پایه این اپلیکیشن به‌صورت رایگان و در ازای مشاهده تبلیغات برنامه‌ریزی شده است.</li>
            <li>مشاهده کامل تبلیغات جایزه‌دار، دسترسی موقت و زمان‌دار به سرورها را فعال می‌سازد.</li>
          </ul>
        </Section>

        <Section number="۳" title="فعالیت‌های اکیداً ممنوع">
          <p>شما متعهد می‌شوید که از Fars VPN تنها برای مقاصد قانونی استفاده کنید. انجام هر یک از موارد زیر از طریق سرورها و شبکه ما اکیداً ممنوع است:</p>
          <ul className="list-disc pr-5 space-y-1 mt-2">
            <li><strong className="text-lavender">الف) حملات سایبری و اختلال:</strong> انجام حملات سایبری (DDoS)، اسکن شبکه، هک، تلاش برای نفوذ یا انتشار بدافزارها و ویروس‌ها.</li>
            <li><strong className="text-lavender">ب) کلاهبرداری و فیشینگ:</strong> سرقت هویت، استفاده غیرقانونی از کارت‌های بانکی، ایجاد صفحات فیشینگ یا انجام هرگونه کلاهبرداری مالی.</li>
            <li><strong className="text-lavender">ج) دانلود و اشتراک‌گذاری غیرقانونی (تورنت):</strong> دانلود، آپلود یا اشتراک‌گذاری فایل‌های دارای حق کپی‌رایت از طریق شبکه‌های همتا‌به‌همتا (P2P / BitTorrent).</li>
            <li><strong className="text-lavender">د) اسپم و پیام‌های انباشته:</strong> ارسال ایمیل‌های تبلیغاتی انبوه، پیام‌های مزاحم یا لینک‌های آلوده.</li>
            <li><strong className="text-lavender">هـ) نقض قوانین کشوری و بین‌المللی:</strong> انجام هرگونه نقض قوانین جاری کشور محل سکونت شما، قوانین بین‌المللی اینترنت و قوانین دیتاسنترهای ارائه‌دهنده زیرساخت.</li>
          </ul>
        </Section>

        <Section number="۴" title="نظارت خودکار و قطع دسترسی متخلفین">
          <p>ما به حریم خصوصی کاربران احترام می‌گذاریم؛ اما جهت حفظ پایداری سرورها و رعایت الزامات قانونی دیتاسنترها:</p>
          <ul className="list-disc pr-5 space-y-1 mt-2">
            <li>این حق برای ما محفوظ است که ابزارهای فیلترینگ خودکار را جهت مسدودسازی ترافیک‌های مخرب (مانند پروتکل تورنت یا اسکن پورت‌ها) فعال نماییم.</li>
            <li>در صورت شناسایی هرگونه سوءاستفاده یا فعالیت غیرقانونی از سوی یک شناسه/کاربر، دسترسی فرد متخلف بلافاصله و بدون اطلاع قبلی به‌صورت دائمی مسدود خواهد شد.</li>
          </ul>
        </Section>

        <Section number="۵" title="سلب مسئولیت و محدودیت‌های خدمات">
          <ul className="list-disc pr-5 space-y-1">
            <li><strong className="text-lavender">ارائه خدمات «به همین شکل موجود»:</strong> سرویس Fars VPN «به همان صورت موجود» ارائه می‌شود و هیچ‌گونه تضمین صریح یا ضمنی درباره عملکرد آن داده نمی‌شود.</li>
            <li><strong className="text-lavender">عدم تضمین عدم قطعی:</strong> به دلیل ماهیت شبکه اینترنت، محدودیت‌های زیرساختی و تعمیرات احتمالی دیتاسنترها، ما هیچ‌گونه تضمینی بابت اتصال ۱۰۰٪ بدون قطعی، سرعت ثابت یا دسترس‌پذیری همیشگی ارائه نمی‌دهیم.</li>
            <li><strong className="text-lavender">عدم مسئولیت در قبال خسارات:</strong> Fars VPN و توسعه‌دهندگان آن هیچ‌گونه مسئولیتی در قبال خسارات مستقیم، غیرمستقیم، اتفاقی یا تبعی ناشی از استفاده یا عدم توانایی در استفاده از این سرویس بر عهده نخواهند داشت.</li>
          </ul>
        </Section>

        <Section number="۶" title="تبلیغات و سرویس‌های شخص ثالث">
          <p>
            این اپلیکیشن از شبکه‌های تبلیغاتی مستقل (مانند گوگل AdMob) استفاده می‌کند. ما هیچ‌گونه کنترل یا مسئولیتی در قبال محتوا، سیاست‌های حریم خصوصی یا عملکرد تبلیغ‌کنندگان شخص ثالث نداریم.
          </p>
        </Section>

        <Section number="۷" title="تغییرات در قوانین">
          <p>
            ما این حق را برای خود محفوظ می‌داریم که در هر زمان قوانین استفاده را بروزرسانی کنیم. ادامه استفاده شما از اپلیکیشن پس از اعمال تغییرات، به منزله پذیرش قوانین جدید خواهد بود.
          </p>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm leading-relaxed text-lavenderDim">
      <div className="text-center space-y-1 pb-4 border-b border-white/5">
        <h2 className="text-lg font-bold text-lavender">TERMS OF SERVICE AND CONDITIONS OF USE</h2>
        <p className="text-xs text-lavenderDim">Last Updated: August 2026</p>
      </div>

      <p>
        Welcome to Fars VPN ("the App", "we", "us", or "our"). By downloading, installing, or using our application, you agree to be bound by the following Terms of Service. If you do not agree with any part of these terms, you must not use this application.
      </p>

      <Section number="1" title="ACCEPTANCE OF TERMS">
        <p>
          By accessing and using Fars VPN, you confirm that you are at least 18 years of age (or have parental/guardian consent) and are legally capable of entering into a binding agreement.
        </p>
      </Section>

      <Section number="2" title="SERVICE OVERVIEW & REVERSE VPN USE">
        <p>
          Fars VPN provides a virtual private network (VPN) routing service designed primarily for overseas users requiring connection via an Iranian IP address ("Reverse VPN").
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>The basic service is provided free of charge, supported by third-party advertisements (e.g., Rewarded Video Ads).</li>
          <li>Viewing required advertisements grants temporary, time-limited access to our VPN nodes.</li>
        </ul>
      </Section>

      <Section number="3" title="STRICTLY PROHIBITED ACTIVITIES">
        <p>You agree to use Fars VPN solely for lawful purposes. You are strictly prohibited from using our services or servers to engage in any of the following activities:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong className="text-lavender">a) Cyberattacks & Disruptions:</strong> Distributed Denial of Service (DDoS) attacks, network scanning, hacking, port probing, or spreading malware/viruses.</li>
          <li><strong className="text-lavender">b) Fraud & Phishing:</strong> Identity theft, credit card fraud, phishing websites, or financial scams.</li>
          <li><strong className="text-lavender">c) Illegal File Sharing:</strong> Downloading, seeding, or distributing copyrighted material via peer-to-peer (P2P) torrent networks (BitTorrent).</li>
          <li><strong className="text-lavender">d) Spamming & Mass Communications:</strong> Sending unsolicited bulk emails, commercial spam, or malicious messages.</li>
          <li><strong className="text-lavender">e) Local & International Law Violations:</strong> Any activity that violates the local laws of your country of residence, international internet regulations, or the laws governing our infrastructure hosting providers.</li>
        </ul>
      </Section>

      <Section number="4" title="MONITORING AND ACCOUNT TERMINATION">
        <p>We respect user privacy; however, to maintain server integrity and comply with hosting provider mandates:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>We reserve the right to deploy automated network filtering tools to block harmful traffic (e.g., BitTorrent protocols or malicious port scans).</li>
          <li>Any user account or device ID identified as engaging in abusive or illegal activities will be immediately and permanently banned without prior notice.</li>
        </ul>
      </Section>

      <Section number="5" title="DISCLAIMER OF WARRANTIES AND SERVICE AVAILABILITY">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-lavender">"AS IS" BASIS:</strong> Fars VPN is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, whether express or implied.</li>
          <li><strong className="text-lavender">NO GUARANTEE OF UNINTERRUPTED SERVICE:</strong> Due to the inherent nature of internet routing, regional network restrictions, and third-party data center maintenance, we DO NOT guarantee 100% uptime, specific connection speeds, or continuous availability.</li>
          <li><strong className="text-lavender">NO LIABILITY FOR DAMAGES:</strong> Under no circumstances shall Fars VPN or its developers be held liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your use or inability to use the service.</li>
        </ul>
      </Section>

      <Section number="6" title="ADVERTISEMENTS & THIRD-PARTY SERVICES">
        <p>
          Our app integrates third-party ad networks (such as Google AdMob). We do not control and are not responsible for the content, privacy policies, or practices of any third-party advertisers or websites linked through ads.
        </p>
      </Section>

      <Section number="7" title="MODIFICATIONS TO TERMS">
        <p>
          We reserve the right to modify these Terms of Service at any time. Continued use of the application following any changes constitutes your acceptance of the new terms.
        </p>
      </Section>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lavender">
        <span className="text-amethyst">{number}.</span> {title}
      </h3>
      {children}
    </div>
  );
}
