"""Build the debug APK with official SDK tools; ECJ is an optional Java compiler.
Usage: python scripts/build-apk.py --sdk /path/to/android-sdk [--ecj /path/to/ecj.jar]
Uses javac when --ecj is omitted. Creates a disposable debug key OUTSIDE source.
"""
import argparse,os,pathlib,subprocess,zipfile,tempfile,xml.etree.ElementTree as ET
parser=argparse.ArgumentParser();parser.add_argument('--sdk',required=True);parser.add_argument('--ecj');args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parent.parent;sdk=pathlib.Path(args.sdk).resolve();tools=sdk/'build-tools/35.0.0';platform=sdk/'platforms/android-35/android.jar';build=root/'build/android';build.mkdir(parents=True,exist_ok=True)
for name in ['java','classes','dex']:(build/name).mkdir(exist_ok=True)
env=os.environ.copy()
def run(*cmd):subprocess.run([str(x)for x in cmd],check=True,env=env)
native=root/'android/app/src/main'
# Gradle supplies the application ID; direct aapt2 needs it in a temporary manifest.
ET.register_namespace('android','http://schemas.android.com/apk/res/android')
manifest=ET.parse(native/'AndroidManifest.xml');manifest.getroot().set('package','app.mindpal');manifest.write(build/'AndroidManifest.xml',encoding='utf-8',xml_declaration=True)
run(tools/'aapt2','compile','--dir',native/'res','-o',build/'resources.zip')
run(tools/'aapt2','link','-o',build/'unsigned.apk','-I',platform,'--manifest',build/'AndroidManifest.xml','--java',build/'java','--min-sdk-version','26','--target-sdk-version','34','-A',root/'web',build/'resources.zip')
sources=list((native/'java').rglob('*.java'))+list((build/'java').rglob('*.java'))
if args.ecj:run('java','-jar',pathlib.Path(args.ecj).resolve(),'-8','-proc:none','-bootclasspath',platform,'-d',build/'classes',*sources)
else:run('javac','-source','8','-target','8','-bootclasspath',platform,'-d',build/'classes',*sources)
with zipfile.ZipFile(build/'classes.jar','w')as z:
 for p in (build/'classes').rglob('*.class'):z.write(p,p.relative_to(build/'classes'))
run(tools/'d8','--lib',platform,'--min-api','26','--output',build/'dex',build/'classes.jar')
with zipfile.ZipFile(build/'unsigned.apk','a',zipfile.ZIP_DEFLATED)as z:
 for p in (build/'dex').glob('*.dex'):z.write(p,p.name)
run(tools/'zipalign','-f','4',build/'unsigned.apk',build/'aligned.apk')
keydir=pathlib.Path(tempfile.gettempdir())/'mindpal-debug-signing';keydir.mkdir(exist_ok=True);key=keydir/'debug.keystore'
if not key.exists():run('keytool','-genkeypair','-keystore',key,'-storepass','android','-alias','androiddebugkey','-keypass','android','-dname','CN=MindPal Debug,O=MindPal,C=LK','-keyalg','RSA','-keysize','2048','-validity','10000')
out=root/'build/MindPal-debug.apk';run(tools/'apksigner','sign','--ks',key,'--ks-pass','pass:android','--key-pass','pass:android','--out',out,build/'aligned.apk');run(tools/'apksigner','verify','--verbose',out);run(tools/'aapt2','dump','badging',out);print('Built',out)
