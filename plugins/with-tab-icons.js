const fs = require('fs');
const path = require('path');

const { withDangerousMod } = require('expo/config-plugins');

/**
 * Sekme ikonlarını gerçek Android drawable kaynağı olarak projeye kopyalar.
 *
 * Neden gerekli: react-native-screens 4.16'nın native tarafı, release
 * derlemesinde JS varlıklarını (`<Icon src={require(...)} />`) yalnızca kaynak
 * adı `_` ile başlıyorsa çözüyor. Expo'nun ürettiği ad `assets_images_...`
 * olduğu için ikon sessizce çizilmiyordu. `drawable` prop'u ise adı doğrudan
 * `getIdentifier` ile arıyor; bu dosyalar o aramanın karşılığı.
 *
 * Yoğunluk eşlemesi React Native'in kuralıyla aynı: @1x mdpi, @2x xhdpi, @3x xxhdpi.
 */
const ICONS = { notes: 'ic_tab_notes', plans: 'ic_tab_plans' };
const DENSITIES = { '': 'drawable-mdpi', '@2x': 'drawable-xhdpi', '@3x': 'drawable-xxhdpi' };

module.exports = function withTabIcons(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const source = path.join(modConfig.modRequest.projectRoot, 'assets', 'images', 'tabIcons');
      const resRoot = path.join(modConfig.modRequest.platformProjectRoot, 'app/src/main/res');

      for (const [file, resourceName] of Object.entries(ICONS)) {
        for (const [suffix, density] of Object.entries(DENSITIES)) {
          const from = path.join(source, `${file}${suffix}.png`);
          const targetDir = path.join(resRoot, density);

          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(from, path.join(targetDir, `${resourceName}.png`));
        }
      }

      return modConfig;
    },
  ]);
};
