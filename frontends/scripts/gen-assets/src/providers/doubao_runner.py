"""Doubao-Seedance image generator via Python SDK.

Called as subprocess by gen-assets when DOUBAO_RUNTIME=python.
Reads DOUBAO_API_KEY from env. Writes base64-encoded PNG to stdout.
"""
import argparse
import base64
import os
import sys


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--aspect", required=True)
    ap.add_argument("--width", type=int, required=True)
    args = ap.parse_args()

    key = os.environ.get("DOUBAO_API_KEY")
    if not key:
        print("DOUBAO_API_KEY missing", file=sys.stderr)
        return 2

    try:
        from volcenginesdkarkruntime import Ark  # type: ignore
    except ImportError:
        print("volcenginesdkarkruntime not installed in pet-pipeline env", file=sys.stderr)
        return 3

    client = Ark(api_key=key)
    w = args.width
    h = int(w * (int(args.aspect.split(":")[1]) / int(args.aspect.split(":")[0])))
    resp = client.images.generate(
        model=os.environ.get("DOUBAO_MODEL", "doubao-seedance-1-0-pro"),
        prompt=args.prompt,
        size=f"{w}x{h}",
        response_format="b64_json",
    )
    b64 = resp.data[0].b64_json
    sys.stdout.write(b64 if isinstance(b64, str) else base64.b64encode(b64).decode())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
