{
  inputs = {
    utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system:
      let 
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_20;
        yarn = pkgs.yarn.override {
          nodejs = nodejs;
        };
      in rec {
        devShell = pkgs.mkShell {
          buildInputs = [
            nodejs
            yarn
          ];
        };
      }
    );
}
