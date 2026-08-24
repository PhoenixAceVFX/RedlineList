const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

const byId = (id) => document.getElementById(id);

const copyField = async (fieldId, button) => {
  const field = byId(fieldId);
  if (!field) return;

  try {
    await navigator.clipboard.writeText(field.value);
  } catch {
    field.select();
    document.execCommand('copy');
  }

  const originalLabel = button.textContent;
  button.textContent = 'Copied';
  setTimeout(() => { button.textContent = originalLabel; }, 1200);
};

const addRepository = () => {
  window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
};

(() => {
  const packageGrid = byId('packageGrid');
  const searchInput = byId('searchInput');
  const addListingToVccHelp = byId('addListingToVccHelp');
  const packageInfoModal = byId('packageInfoModal');
  const rowMoreMenu = byId('rowMoreMenu');
  let activeZipUrl = '';

  searchInput?.addEventListener('input', ({ target: { value = '' } }) => {
    const query = value.trim().toLowerCase();
    packageGrid?.querySelectorAll('fluent-data-grid-row[row-type="default"]').forEach((item) => {
      const match = !query || item.dataset.packageName?.toLowerCase().includes(query) || item.dataset.packageId?.toLowerCase().includes(query);
      item.style.display = match ? 'grid' : 'none';
    });
  });

  byId('vccAddRepoButton')?.addEventListener('click', addRepository);
  document.querySelectorAll('.rowAddToVccButton').forEach((button) => button.addEventListener('click', addRepository));

  byId('vccUrlFieldCopy')?.addEventListener('click', (event) => copyField('vccUrlField', event.currentTarget));
  byId('vccListingInfoUrlFieldCopy')?.addEventListener('click', (event) => copyField('vccListingInfoUrlField', event.currentTarget));
  byId('packageInfoVccUrlFieldCopy')?.addEventListener('click', (event) => copyField('packageInfoVccUrlField', event.currentTarget));

  byId('urlBarHelp')?.addEventListener('click', () => { addListingToVccHelp.hidden = false; });
  byId('packageInfoListingHelp')?.addEventListener('click', () => { addListingToVccHelp.hidden = false; });
  byId('addListingToVccHelpClose')?.addEventListener('click', () => { addListingToVccHelp.hidden = true; });
  byId('packageInfoModalClose')?.addEventListener('click', () => { packageInfoModal.hidden = true; });

  document.querySelectorAll('.rowMenuButton').forEach((button) => {
    button.addEventListener('click', (event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      activeZipUrl = event.currentTarget.dataset.packageUrl || '';
      rowMoreMenu.style.top = `${bounds.bottom + window.scrollY}px`;
      rowMoreMenu.style.left = `${bounds.left + window.scrollX - 120}px`;
      rowMoreMenu.hidden = false;
    });
  });

  byId('rowMoreMenuDownload')?.addEventListener('click', () => {
    if (activeZipUrl) window.open(activeZipUrl, '_blank', 'noopener');
    rowMoreMenu.hidden = true;
  });

  document.addEventListener('click', (event) => {
    if (!rowMoreMenu.hidden && !rowMoreMenu.contains(event.target) && !event.target.closest('.rowMenuButton')) rowMoreMenu.hidden = true;
  });

  const packageInfoName = byId('packageInfoName');
  const packageInfoId = byId('packageInfoId');
  const packageInfoVersion = byId('packageInfoVersion');
  const packageInfoDescription = byId('packageInfoDescription');
  const packageInfoAuthor = byId('packageInfoAuthor');
  const packageInfoDependencies = byId('packageInfoDependencies');
  const packageInfoKeywords = byId('packageInfoKeywords');
  const packageInfoLicense = byId('packageInfoLicense');

  document.querySelectorAll('.rowPackageInfoButton').forEach((button) => {
    button.addEventListener('click', (event) => {
      const packageInfo = PACKAGES[event.currentTarget.dataset.packageId];
      if (!packageInfo) return;

      packageInfoName.textContent = packageInfo.displayName;
      packageInfoId.textContent = packageInfo.name;
      packageInfoVersion.textContent = `v${packageInfo.version}`;
      packageInfoDescription.textContent = packageInfo.description;
      packageInfoAuthor.textContent = packageInfo.author.name;
      packageInfoAuthor.href = packageInfo.author.url || '#';

      packageInfoDependencies.replaceChildren(...Object.entries(packageInfo.dependencies).map(([name, version]) => {
        const item = document.createElement('li');
        item.textContent = `${name} @ v${version}`;
        return item;
      }));

      const keywordSection = packageInfoKeywords.parentElement;
      keywordSection.classList.toggle('hidden', packageInfo.keywords.length === 0);
      packageInfoKeywords.replaceChildren(...packageInfo.keywords.map((keyword) => {
        const tag = document.createElement('span');
        tag.className = 'badge';
        tag.textContent = keyword;
        return tag;
      }));

      const licenseSection = packageInfoLicense.parentElement;
      const hasLicense = Boolean(packageInfo.license || packageInfo.licensesUrl);
      licenseSection.classList.toggle('hidden', !hasLicense);
      packageInfoLicense.textContent = packageInfo.license || 'See license';
      packageInfoLicense.href = packageInfo.licensesUrl || '#';
      packageInfoModal.hidden = false;
    });
  });
})();
